"""Colour pipeline for interior footage (the private office), Apple Log 2 from the Blackmagic Camera app.
Order of operations used by colourists (Resolve / ACES; gamut.io "3-step method", Frame.io node templates):
  1. input transform: Apple Log 2 -> ACEScct (official OCIO transform), never grade the flat log;
  2. exposure, then contrast around 18 % grey;
  3. white balance: a white reference (the table) is made neutral, measured, not guessed;
  4. saturation;
  5. shot matching: every clip is measured the same way and gets the same target;
  6. secondaries: none here (no skin, no stray colour);
  7. look: last and light (version B only);
  8. output: ACES 2.0 SDR, Rec.709 gamma 2.2 for phones; sharpening happens at 1080 in the reel engine.
Lesson kept from the ring (17 Nov): no stacked layers, no crushed blacks, no desaturation, no vignette, no grain.

Usage: bureau_grade.py DIR CLIP:t:x:y ...   (measures on those table patches, bakes A and B LUTs, writes stills + sheet)
       bureau_grade.py DIR --render CLIP ...   (applies the LUTs to whole clips, vertical 4K mezzanines)
"""
import json, os, subprocess, sys
import numpy as np
sys.path.insert(0, os.environ.get("GRADE_LAB", os.path.dirname(os.path.abspath(__file__))))
import lab  # noqa: E402  (OCIO processors, primary(), finish())

TABLE_TARGET = 0.86      # display value of the white table: bright, but never clipped (detail kept)
WARM_KEEP_B = 0.15       # version B keeps 15 % of the room's warmth (a lived-in interior, not clinical)


def frame(path, t, w=540, h=960):
    """Apple Log 2 code values (full range, 0-1) of one frame, rotated upright like the phone."""
    cmd = ["ffmpeg", "-v", "error", "-ss", str(t), "-i", path, "-frames:v", "1", "-vf",
           f"scale=in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,scale={w}:{h}:flags=area,format=rgb48le",
           "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return (np.frombuffer(raw, np.uint16).reshape(h, w, 3).astype(np.float32) / 65535.0)


def table_pixels(P, xy):
    """24 x 24 patch of the white table at (x, y) of the 540 x 960 frame.
    Picked by eye on purpose: under the office's warm light the table is strongly orange in the log file
    (ACEScg about 1.3 / 0.96 / 0.5), and an automatic 'low chroma' filter misses it (18 Nov 2026)."""
    x, y = xy
    return P[y - 12:y + 12, x - 12:x + 12].reshape(-1, 3)


def measure(patches):
    """White balance gains (ACEScg) and exposure (stops) that put the table at TABLE_TARGET, neutral."""
    P = np.concatenate(patches)
    lin = lab.apply(lab.P_LIN, lab.apply(lab.P_IN, P))
    med = np.median(lin, 0)
    wb = (med @ lab.AP1_LUM) / med
    lo, hi = -3.0, 3.0
    for _ in range(30):
        e = (lo + hi) / 2
        out = lab.primary(P, dict(wb=list(wb), exp=e, con=1.0, sat=1.0))
        v = np.median(out @ np.array([0.2126, 0.7152, 0.0722]))
        lo, hi = (e, hi) if v < TABLE_TARGET else (lo, e)
    return wb, e, med


def looks(wb, e):
    warm = 1 + (1 / wb - 1) * WARM_KEEP_B          # move 15 % of the way back toward the original cast
    return {
        "A_corrige": dict(name="Bureau A corrigé", wb=list(wb), exp=e - 0.25, con=1.0, sat=1.0),   # -1/4 stop: close-ups of the white table keep texture
        "B_cinema": dict(name="Bureau B cinéma léger", wb=list(wb * warm), exp=e - 0.3, con=1.08, sat=1.03,
                         shoulder=0.90, black=0.012),
    }


def bake(L, path, N=65):
    r = np.linspace(0, 1, N)
    B, G, R = np.meshgrid(r, r, r, indexing="ij")
    P = np.stack([R, G, B], -1).reshape(-1, 3)
    out = lab.finish(lab.primary(P, L), L)
    with open(path, "w") as f:
        f.write(f'TITLE "{L["name"]}"\nLUT_3D_SIZE {N}\n')
        np.savetxt(f, out, fmt="%.6f")


def still(path, t, cube, out_png):
    vf = "scale=in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=gbrp16le"
    if cube:
        vf += f",lut3d=file={cube}:interp=tetrahedral"
    else:  # raw log, for the before/after
        vf += ",format=gbrp"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", path, "-frames:v", "1", "-vf",
                    vf + ",scale=540:960:flags=lanczos", out_png], check=True)


def render(path, cube, out):
    vf = ("scale=in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=gbrp16le,"
          f"lut3d=file={cube}:interp=tetrahedral,scale=out_range=tv:out_color_matrix=bt709,format=yuv420p")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-vf", vf, "-c:v", "libx264", "-preset", "medium",
                    "-crf", "14", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                    "-c:a", "aac", "-b:a", "192k", "-map_metadata", "-1", "-movflags", "+faststart", out + ".part.mp4"],
                   check=True)
    os.replace(out + ".part.mp4", out)


if __name__ == "__main__":
    D = sys.argv[1]
    if sys.argv[2] == "--render":
        for clip in sys.argv[3:]:
            for k in ("A_corrige", "B_cinema"):
                render(f"{D}/{clip}.mov", f"{D}/{k}.cube", f"{D}/{clip}_{k}.mp4")
                print("rendered", clip, k, flush=True)
        sys.exit()
    picks = [a.split(":") for a in sys.argv[2:]]          # CLIP:t:x:y  (x, y on the table, 540 x 960 frame)
    cache, patches, per_clip = {}, [], {}
    for c, t, x, y in picks:
        if (c, t) not in cache:
            cache[(c, t)] = frame(f"{D}/{c}.mov", t)
        p = table_pixels(cache[(c, t)], (int(x), int(y)))
        patches.append(p)
        w1, e1, _ = measure([p])                          # shot matching check: each patch measured alone
        per_clip[f"{c}@{t}:{x},{y}"] = dict(wb=[round(float(v), 3) for v in w1], exp=round(float(e1), 2))
    wb, e, med = measure(patches)
    report = dict(wb=[round(float(v), 3) for v in wb], exp=round(float(e), 2),
                  table_aces_median=[round(float(v), 4) for v in med], per_clip=per_clip)
    print(json.dumps(report, indent=1))
    json.dump(report, open(f"{D}/measure.json", "w"), indent=1)
    for k, L in looks(wb, e).items():
        bake(L, f"{D}/{k}.cube")
    for c, t in cache:
        for k in ("raw", "A_corrige", "B_cinema"):
            still(f"{D}/{c}.mov", t, None if k == "raw" else f"{D}/{k}.cube", f"{D}/st_{c}_{t}_{k}.png")
    print("baked and stills written", flush=True)
