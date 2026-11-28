"""Gift edit for a client whose ring is finished: 15 to 25 s, vertical 1080x1920, soft cross-fades,
a slow push-in on every shot, licensed music, and a closing card with the official logo (drawn in
cream on black; the logo file itself is never modified) and one short line.

Not a reel: no hook, no caption. It is sent privately to the client by Rayane.

    python3 cadeau.py <spec.json> <outdir>
spec = {"name": "...", "music": "225.mp3", "music_start": 0, "xfade": 0.45,
        "shots": [{"clip": path, "start": 6.0, "dur": 3.0, "zoom": [1.8, 2.0], "center": optional [x, y]}],
        "card": {"line": "Créée pour Elliott · Montréal", "dur": 3.2}}
"""
import json
import os
import subprocess
import sys

from boucle import GRADE, proxy_frames, ring_center

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
LOGO = f"{REPO}/tools/invoicing/assets/logo.png"  # official logo, never modified
FONT = os.environ.get("BETO_FONT", "")
FPS = 24


def run(cmd):
    subprocess.run(cmd, check=True)


def shot(s, out):
    """One shot from the 4K source: slow push-in from zoom[0] to zoom[1], centred on the ring."""
    fr, pfps = proxy_frames(s["clip"])
    cx, cy = s.get("center") or ring_center(fr, int(s["start"] * pfps), int((s["start"] + s["dur"]) * pfps))
    z0, z1 = s.get("zoom", [1.6, 1.75])
    n = max(1, int(round(s["dur"] * FPS)))
    z = f"({z0}+({z1}-{z0})*on/{n})"
    # zoompan: x, y are the top-left corner of the window, kept inside the frame
    zp = (f"zoompan=z='{z}':x='min(max(iw*{cx:.3f}-iw/zoom/2,0),iw-iw/zoom)':"
          f"y='min(max(ih*{cy:.3f}-ih/zoom/2,0),ih-ih/zoom)':d=1:s=1080x1920:fps={FPS}")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{s['start']:.3f}", "-t", f"{s['dur']:.3f}",
         "-i", s["clip"], "-vf", f"fps={FPS},{zp},{GRADE},setsar=1,format=yuv420p",
         "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "12", out])
    return [round(cx, 3), round(cy, 3)]


SERIF_ITALIC = os.environ.get("BETO_SERIF_ITALIC", "")  # Bodoni Moda italic (.woff from @fontsource/bodoni-moda)


def card(c, out):
    """Closing card: black, the logo in cream fading in, then the lines one after the other.
    c = {"dur": 8.5, "logo_w": 420, "logo_y": -470,
         "lines": [{"text": "...", "font": "serif_italic" | "sans", "size": 70, "y": -60, "t": 0.9, "alpha": 1}]}
    The older form {"line": "..."} still works (one small line under the logo)."""
    d = c.get("dur", 3.2)
    lines = c.get("lines")
    if lines is None:
        lines = [{"text": c["line"], "size": 46, "y": 150, "t": 0.9}] if c.get("line") else []
        logo_w, logo_y = 560, -140
    else:
        logo_w, logo_y = c.get("logo_w", 420), c.get("logo_y", -470)
    vf = (f"[1:v]scale={logo_w}:-1,format=rgba,colorchannelmixer=rr=0:gg=0:bb=0:ra=0:ga=0:ba=0,"
          f"lutrgb=r=236:g=226:b=208,fade=t=in:st=0.25:d=0.9:alpha=1[lg];"
          f"[0:v][lg]overlay=(W-w)/2:(H-h)/2+({logo_y})[b]")
    chain = []
    for ln in lines:
        font = SERIF_ITALIC if ln.get("font") == "serif_italic" and SERIF_ITALIC else FONT
        if not font:
            continue
        txt = ln["text"].replace(":", r"\:").replace("'", "’")
        a, t0 = ln.get("alpha", 1), ln.get("t", 0.9)
        chain.append(f"drawtext=fontfile={font}:text='{txt}':fontsize={ln.get('size', 46)}:fontcolor=0xECE2D0:"
                     f"x=(w-text_w)/2:y=h/2+({ln.get('y', 150)}):alpha='{a}*min(1,max(0,(t-{t0})/0.8))'")
    last = "b"
    if chain:
        vf += ";[b]" + ",".join(chain) + "[t]"
        last = "t"
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=black:s=1080x1920:r={FPS}:d={d}",
         "-loop", "1", "-t", f"{d}", "-i", LOGO, "-filter_complex", vf, "-map", f"[{last}]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", out])


def render(spec, out):
    os.makedirs(out, exist_ok=True)
    tmp = os.path.join(out, f"_{spec['name']}")
    os.makedirs(tmp, exist_ok=True)
    parts, durs = [], []
    for k, s in enumerate(spec["shots"]):
        p = os.path.join(tmp, f"s{k}.mp4")
        s["center_used"] = shot(s, p)
        parts.append(p)
        durs.append(s["dur"])
    if spec.get("card"):
        p = os.path.join(tmp, "card.mp4")
        card(spec["card"], p)
        parts.append(p)
        durs.append(spec["card"].get("dur", 3.2))
    xf = spec.get("xfade", 0.45)
    inputs, filters, prev, acc = [], [], "0:v", durs[0]
    for p in parts:
        inputs += ["-i", p]
    for k in range(1, len(parts)):
        filters.append(f"[{prev}][{k}:v]xfade=transition=fade:duration={xf}:offset={acc - xf:.3f}[x{k}]")
        prev = f"x{k}"
        acc += durs[k] - xf
    total = acc
    filters.append(f"[{prev}]fade=t=in:st=0:d=0.5,fade=t=out:st={total - 0.6:.3f}:d=0.6[v]")
    mus = os.path.join(os.environ.get("BETO_MUSIC_DIR", "."), spec["music"])
    final = os.path.join(out, f"{spec['name']}.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", *inputs, "-ss", str(spec.get("music_start", 0)), "-i", mus,
         "-filter_complex", ";".join(filters) +
         f";[{len(parts)}:a]afade=t=in:d=0.6,afade=t=out:st={total - 1.8:.2f}:d=1.8,loudnorm=I=-16:TP=-1.5:LRA=11[a]",
         "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "slow", "-crf", "17",
         "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final])
    return total


def recard(video, keep, spec, out):
    """Swap the closing card of a finished gift edit without going back to the 4K sources.
    keep = old total - old card duration: the moment the old cross-fade into the card began, so
    everything before it is pure footage. The new card cross-fades over the last xfade seconds of that
    footage (the last shot ends a little earlier). The music is laid again over the new length."""
    tmp = os.path.join(out, f"_{spec['name']}")
    os.makedirs(tmp, exist_ok=True)
    head, cardp = os.path.join(tmp, "head.mp4"), os.path.join(tmp, "card2.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", video, "-t", f"{keep:.3f}", "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", "14", "-pix_fmt", "yuv420p", head])
    card(spec["card"], cardp)
    xf = spec.get("xfade", 0.45)
    total = keep - xf + spec["card"]["dur"]
    mus = os.path.join(os.environ.get("BETO_MUSIC_DIR", "."), spec["music"])
    final = os.path.join(out, f"{spec['name']}.mp4")
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", head, "-i", cardp,
         "-ss", str(spec.get("music_start", 0)), "-i", mus, "-filter_complex",
         f"[0:v][1:v]xfade=transition=fade:duration={xf}:offset={keep - xf:.3f},"
         f"fade=t=out:st={total - 0.6:.3f}:d=0.6[v];"
         f"[2:a]afade=t=in:d=0.6,afade=t=out:st={total - 2.2:.2f}:d=2.2,loudnorm=I=-16:TP=-1.5:LRA=11[a]",
         "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}", "-c:v", "libx264", "-preset", "slow", "-crf", "17",
         "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final])
    return total


if __name__ == "__main__":
    if sys.argv[1] == "recard":
        # python3 cadeau.py recard <video.mp4> <keep_seconds> <spec.json> <outdir>
        spec = json.load(open(sys.argv[4]))
        print(spec["name"], f"{recard(sys.argv[2], float(sys.argv[3]), spec, sys.argv[5]):.2f}s")
        sys.exit(0)
    spec = json.load(open(sys.argv[1]))
    t = render(spec, sys.argv[2])
    print(spec["name"], f"{t:.2f}s", [s["center_used"] for s in spec["shots"]])
