"""Format A of REGLES_CONTENU.md: the product loop (7 to 12 s, macro, 2 to 4 shots cut on the beat,
at most one line of text, the full spec sheet goes in the caption).

For each source clip, the brightest sparkle window is picked automatically (share of near-white specular
pixels, measured at 8 fps on a small proxy). Writes two files:
  <name>_APP.mp4  silent, for Rayane to post in the app with a trending song
  <name>.mp4      with a licensed track (BETO_MUSIC_DIR), loudness -14 LUFS

    python3 boucle.py <spec.json> <outdir>
spec = {"name": "...", "bpm": 120, "text": "",
        "shots": [{"clip": path, "beats": 6, "start": optional seconds, "zoom": 1.7, "center": optional [x, y]}],
        "music": "file.mp3", "music_start": 0}
"""
import json
import os
import subprocess
import sys

import numpy as np

FONT = os.environ.get("BETO_FONT", "")
GRADE = "eq=contrast=1.16:brightness=-0.025:saturation=1.06,curves=all='0/0 0.25/0.16 0.6/0.63 1/1',unsharp=5:5:0.5"


def probe_dur(p):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", p]).decode().strip())


def sparkle_curve(p, fps=8, w=135, h=240):
    raw = subprocess.check_output(["ffmpeg", "-nostdin", "-v", "error", "-i", p, "-vf",
                                   f"fps={fps},scale={w}:{h},format=gray", "-f", "rawvideo", "-"])
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w)
    return (fr > 235).mean(axis=(1, 2)), fps


def proxy_frames(p, fps=8, w=135, h=240):
    raw = subprocess.check_output(["ffmpeg", "-nostdin", "-v", "error", "-i", p, "-vf",
                                   f"fps={fps},scale={w}:{h},format=gray", "-f", "rawvideo", "-"])
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w), fps


def best_start(p, length, fr=None, fps=8):
    if fr is None:
        fr, fps = proxy_frames(p)
    curve = (fr > 235).mean(axis=(1, 2))
    n = int(round(length * fps))
    if len(curve) <= n:
        return 0.0
    win = np.convolve(curve, np.ones(n) / n, mode="valid")
    # keep away from the very first and last half second (camera start / stop)
    lo, hi = int(0.5 * fps), max(int(0.5 * fps) + 1, len(win) - int(0.5 * fps))
    i = lo + int(np.argmax(win[lo:hi]))
    return i / fps


def ring_center(fr, i0, i1):
    """Mean centroid (0-1) of the bright pixels (gold and diamond on a dark background) over frames i0..i1."""
    xs, ys = [], []
    for f in fr[i0:i1]:
        yy, xx = np.nonzero(f > 110)
        if len(xx) > 20:
            xs.append(xx.mean() / f.shape[1])
            ys.append(yy.mean() / f.shape[0])
    if not xs:
        return 0.5, 0.5
    return float(np.median(xs)), float(np.median(ys))


def render(spec, out):
    beat = 60.0 / spec.get("bpm", 120)
    parts, filters, t = [], [], 0.0
    for k, s in enumerate(spec["shots"]):
        length = s["beats"] * beat
        fr, fps = proxy_frames(s["clip"])
        start = s.get("start")
        if start is None:
            start = best_start(s["clip"], length, fr, fps)
        s["start_used"] = round(start, 2)
        z = s.get("zoom", 1.0)
        crop = ""
        if z > 1.0:
            cx, cy = s.get("center") or ring_center(fr, int(start * fps), int((start + length) * fps))
            # a 9:16 window 1/z of the frame, centred on the ring, kept inside the frame
            crop = (f"crop=iw/{z}:ih/{z}:min(max(iw*{cx:.3f}-iw/{z}/2\\,0)\\,iw-iw/{z}):"
                    f"min(max(ih*{cy:.3f}-ih/{z}/2\\,0)\\,ih-ih/{z}),")
            s["center_used"] = [round(cx, 3), round(cy, 3)]
        parts += ["-ss", f"{start:.3f}", "-t", f"{length:.3f}", "-i", s["clip"]]
        filters.append(f"[{k}:v]{crop}scale=1080:1920:flags=lanczos,fps=24,{GRADE},setsar=1[v{k}]")
        t += length
    n = len(spec["shots"])
    filters.append("".join(f"[v{k}]" for k in range(n)) + f"concat=n={n}:v=1:a=0[cat]")
    last = "cat"
    if spec.get("text") and FONT:
        # one drawtext per line ("\n" in the spec), centred, so a long hook never runs off the 1080 px frame
        size = spec.get("fontsize", 66)
        chain = []
        for i, line in enumerate(spec["text"].split("\n")):
            txt = line.replace(":", r"\:").replace("'", "’")
            chain.append(f"drawtext=fontfile={FONT}:text='{txt}':fontsize={size}:fontcolor=white:"
                         f"x=(w-text_w)/2:y=h*0.17+{i * round(size * 1.25)}:shadowcolor=black@0.55:shadowx=0:shadowy=3:"
                         f"enable='lt(t,{spec.get('text_dur', 2.6)})'")
        filters.append("[cat]" + ",".join(chain) + "[txt]")
        last = "txt"
    os.makedirs(out, exist_ok=True)
    app = os.path.join(out, f"{spec['name']}_APP.mp4")
    common = ["-map", f"[{last}]", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
              "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart"]
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", *parts, "-filter_complex", ";".join(filters),
                    *common, "-an", app], check=True)
    if spec.get("music"):
        mus = os.path.join(os.environ.get("BETO_MUSIC_DIR", "."), spec["music"])
        withm = os.path.join(out, f"{spec['name']}.mp4")
        subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", app, "-ss", str(spec.get("music_start", 0)),
                        "-i", mus, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af",
                        f"afade=t=in:d=0.3,afade=t=out:st={t - 0.8:.2f}:d=0.8,loudnorm=I=-14:TP=-1.5:LRA=11",
                        "-c:a", "aac", "-b:a", "192k", "-shortest", withm], check=True)
    return t


if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    total = render(spec, sys.argv[2])
    print(spec["name"], f"{total:.2f}s", [(s["start_used"], s.get("center_used")) for s in spec["shots"]])
