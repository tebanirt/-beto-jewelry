"""Best photos out of a ring video (21 Nov 2026: « prends la meilleure partie de la vidéo et fais-en une photo » for
Facebook Marketplace and the site).

For each master (2160x3840, ring measured by ringframe.extents), every 1/4 s:
  sharpness = variance of the Laplacian inside the ring box (no motion blur, focus on the stone),
  sparkle   = share of near-white pixels inside the ring box (facets catching the light).
Frames are ranked on both (z-scores added), then picked at least GAP seconds apart so each photo is another angle.
Each photo is a square crop centred on the ring, wide enough that the WHOLE ring fits with air around it (never a
crop into the band), from the 4K master, lightly sharpened, 2048 x 2048 JPEG (Facebook's recommended long side).
Nothing is retouched or invented: it is a frame of the real video.
Usage: stills_pick.py OUTDIR NAME:CLIP:N [NAME:CLIP:N ...]"""
import os, subprocess, sys
import numpy as np
from scipy.ndimage import laplace
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ringframe as rf

W, H, FPS = 2160, 3840, 24
GAP = 1.5            # seconds between two picks
AIR = 1.45           # square side = ring size x AIR (the ring takes about 70 % of the photo)


def frames(path, step=6):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"select='not(mod(n\\,{step}))',scale=540:960,format=gray",
                          "-vsync", "0", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 960, 540).astype(np.float32)


def pick(path, n, step=6):
    e = rf.extents(path)
    f = frames(path, step)
    rows = []
    for k, a in enumerate(f):
        i = min(k * step, len(e) - 1)
        l, r, t, b = (e[i] / 4).astype(int)
        box = a[max(t, 0):b + 1, max(l, 0):r + 1]
        if box.size < 400:
            continue
        rows.append((i, laplace(box).var(), (box > 235).mean()))
    rows = np.array(rows)
    z = lambda v: (v - v.mean()) / (v.std() + 1e-9)
    score = z(rows[:, 1]) + z(rows[:, 2])
    chosen = []
    for j in np.argsort(score)[::-1]:
        i = int(rows[j, 0])
        if all(abs(i - c) >= GAP * FPS for c in chosen):
            chosen.append(i)
        if len(chosen) == n:
            break
    return [(i, e[i]) for i in sorted(chosen)]


def save(path, i, ext, out):
    l, r, t, b = ext
    side = int(min(W, max((r - l), (b - t)) * AIR)) // 2 * 2
    cx, cy = (l + r) / 2, (t + b) / 2
    x = int(np.clip(cx - side / 2, 0, W - side)); y = int(np.clip(cy - side / 2, 0, H - side))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{i / FPS:.3f}", "-i", path, "-frames:v", "1", "-vf",
                    f"crop={side}:{side}:{x}:{y},scale=2048:2048:flags=lanczos,unsharp=5:5:0.4:5:5:0",
                    "-q:v", "1", out], check=True)


if __name__ == "__main__":
    outdir = sys.argv[1]
    os.makedirs(outdir, exist_ok=True)
    for spec in sys.argv[2:]:
        name, clip, n = spec.split(":")
        path = clip if clip.endswith(".mp4") else f"assets/{clip}.mp4"
        for k, (i, ext) in enumerate(pick(path, int(n)), 1):
            out = f"{outdir}/{name}_{k}.jpg"
            save(path, i, ext, out)
            print(out, f"t={i / FPS:.2f}s", flush=True)
