"""Diamond mask that follows the stone, not every bright area (the polished band stays gold).
Reads 540x960 gray frames of the graded clip on stdin, writes the mask frames (gray) to stdout.
The stone is where the facet texture (many small internal edges in bright areas) is densest; the band is smooth."""
import sys, numpy as np
from scipy.ndimage import gaussian_filter
W, H, R = 540, 960, float(sys.argv[1]) if len(sys.argv) > 1 else 80.0
TOP = 165                                   # backdrop at the top of the frame
yy, xx = np.mgrid[0:H, 0:W]
frames = np.frombuffer(sys.stdin.buffer.read(), np.uint8).reshape(-1, H, W).astype(np.float32) / 255
peaks = []
for Y in frames:
    hf = np.abs(Y - gaussian_filter(Y, 1.2)) * (Y > 0.35)
    E = gaussian_filter(hf, 16); E[:TOP] = 0
    peaks.append(np.unravel_index(np.argmax(E), E.shape))
p = np.array(peaks, np.float32)
k = 7; pad = np.pad(p, ((k, k), (0, 0)), mode="edge")
p = np.array([np.median(pad[i:i + 2 * k + 1], 0) for i in range(len(p))])     # steady, no jitter
p = gaussian_filter(p, (2, 0))
out = sys.stdout.buffer
for (py, px), Y in zip(p, frames):
    d = np.sqrt(((xx - px) / R) ** 2 + ((yy - py) / (R * 1.25)) ** 2)
    c = gaussian_filter((Y > 0.22).astype(np.float32), 5)                      # fill the darker facets inside the stone
    m = np.clip(1.7 - 1.3 * d, 0, 1) * np.clip((c - 0.12) / 0.2, 0, 1)         # flat-top disc, soft edge; velvet has no chroma anyway
    out.write((gaussian_filter(m, 2) * 255).astype(np.uint8).tobytes())
sys.stderr.write(f"{len(frames)} frames, peak y {p[:,0].min():.0f}-{p[:,0].max():.0f} x {p[:,1].min():.0f}-{p[:,1].max():.0f}\n")
