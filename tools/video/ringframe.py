"""Safe framing for the ring-lock (Rayane, 20 Nov 2026: « enlève les super zooms… la bague disparaît sur les extrémités »).
Measures the ring's real extent in every frame of a 2160x3840 master (bright pixels over the dark fabric, at 540x960),
then gives the tightest zoom that keeps the WHOLE ring inside the safe area for the whole clip (or a time window):
  - below the price card (ring top under 33 % of the height),
  - inside the 4:5 feed crop (ring bottom above 80 %),
  - 4 % margin on the sides.
Usage: ringframe.py MASTER.mp4 [t0 t1]  -> prints zoom and RING_Y, saves MASTER_extent.npy (per frame: left, right, top, bottom)."""
import os, subprocess, sys
import numpy as np
from scipy.ndimage import binary_opening, binary_dilation, label

TOP, BOT, SIDE = 0.33, 0.80, 0.46          # safe area, as fractions of the 9:16 output
MAX_ZOOM = 1.4                              # never a "super zoom" (Rayane, 20 Nov 2026), even when the ring would fit tighter
W, H, S = 2160, 3840, 4                     # source size, analysis scale factor (540x960)


def ring_mask(a):
    """Bright pixels that belong to rings: drops the lit backdrop behind the turntable (a band that touches both sides
    of the frame) and the scattered glints of the fabric (small blobs far from the rings). 21 Nov 2026."""
    m = binary_opening(a > np.median(a) + 40, np.ones((3, 3)))
    lab, n = label(binary_dilation(m, np.ones((7, 7))))
    if n == 0:
        return m
    keep = np.zeros(n + 1, bool)
    sizes = np.bincount(lab.ravel(), minlength=n + 1)
    hits = np.bincount(lab.ravel(), weights=m.ravel(), minlength=n + 1)
    big = sizes[1:].max()
    H, W = a.shape
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        backdrop = ys.mean() < 0.2 * H or (xs.max() - xs.min()) > 0.9 * W     # the lit band behind the turntable
        backdrop |= ys.mean() > 0.75 * H                                      # glints on the turntable's front edge
        sparse = hits[i] / sizes[i] < 0.2                                     # scattered glints of the fabric
        keep[i] = sizes[i] >= 0.05 * big and not backdrop and not sparse
    return m & keep[lab]


def extents(path):
    cache = path.replace(".mp4", "_extent.npy")
    if os.path.exists(cache):
        return np.load(cache)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", "scale=540:960,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 960, 540)
    out = []
    for a in fr:
        m = ring_mask(a)
        ys, xs = np.nonzero(m)
        if len(xs) < 50:
            out.append([np.nan] * 4); continue
        out.append([np.percentile(xs, .2), np.percentile(xs, 99.8), np.percentile(ys, .2), np.percentile(ys, 99.8)])
    e = np.array(out) * S
    for j in range(4):
        v = e[:, j]; m = np.isnan(v)
        if m.any() and (~m).any():
            v[m] = np.interp(np.flatnonzero(m), np.flatnonzero(~m), v[~m])
    np.save(cache, e)
    return e


def safe(path, t0=None, t1=None, fps=24):
    e = extents(path)
    tr = np.load(path.replace(".mp4", "_track.npy"))
    n = min(len(e), len(tr))
    a = 0 if t0 is None else int(t0 * fps); b = n if t1 is None else min(n, int(t1 * fps))
    e, tr = e[a:b], tr[a:b]
    l, r, t, bo = e.T; cx, cy = tr[:, 0], tr[:, 1]
    ring_y = (TOP + BOT) / 2                                   # centre of the safe band
    room = (BOT - TOP) / 2
    need_h = np.maximum.reduce([(cy - t) / room, (bo - cy) / room,
                                np.maximum(cx - l, r - cx) / SIDE * 16 / 9])
    h = float(np.max(need_h))
    zoom = min(MAX_ZOOM, max(1.0, H / h))
    return dict(zoom=round(zoom, 2), ring_y=round(ring_y, 3), frames=b - a,
                ring_w=round(float(np.max(r - l)) / W, 2), ring_h=round(float(np.max(bo - t)) / H, 2))


if __name__ == "__main__":
    p = sys.argv[1]
    t0, t1 = (float(sys.argv[2]), float(sys.argv[3])) if len(sys.argv) > 3 else (None, None)
    print(p, safe(p, t0, t1))
