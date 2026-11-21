"""Track the ring (bounding box of bright pixels) in every frame of a 2160x3840 clip, at 270x480. Prints drift and jitter."""
import subprocess, sys, numpy as np
from scipy.ndimage import gaussian_filter1d
P = sys.argv[1]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", P, "-vf", "scale=270:480,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, 480, 270).astype(np.float32)
cx, cy = [], []
for a in f:
    a = a.copy(); a[:125] = 0
    ys, xs = np.nonzero(a > 150)
    if len(xs) < 30: cx.append(np.nan); cy.append(np.nan); continue
    cx.append((np.percentile(xs, 2) + np.percentile(xs, 98)) / 2 * 8); cy.append((np.percentile(ys, 2) + np.percentile(ys, 98)) / 2 * 8)
cx, cy = np.array(cx), np.array(cy)
for v in (cx, cy):
    m = np.isnan(v); v[m] = np.interp(np.flatnonzero(m), np.flatnonzero(~m), v[~m]) if m.any() else v[m]
sx, sy = gaussian_filter1d(cx, 6), gaussian_filter1d(cy, 6)
print(f"{P}: {len(f)} frames | drift x {cx.min():.0f}-{cx.max():.0f} ({cx.max()-cx.min():.0f} px) y {cy.min():.0f}-{cy.max():.0f} ({cy.max()-cy.min():.0f} px) | jitter (frame-to-frame, after smoothing removed) x {np.std(cx-sx):.1f} y {np.std(cy-sy):.1f} px")
np.save(P.replace('.mp4', '_track.npy'), np.stack([sx, sy], 1))
