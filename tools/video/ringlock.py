"""Ring-lock: crop window follows the smoothed ring position frame by frame, so the ring stays put while it turns.
Usage: ringlock.py SRC(2160x3840) ZOOM OUT  (needs SRC_track.npy from ringtrack.py). Output 1080x1920, lanczos, no upscale."""
import subprocess, sys, numpy as np
from scipy.ndimage import gaussian_filter1d
src, zoom, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
W, H = 2160, 3840
tr = np.load(src.replace('.mp4', '_track.npy'))
sx, sy = gaussian_filter1d(tr[:, 0], 8), gaussian_filter1d(tr[:, 1], 8)   # extra smoothing: no swimming
w = int(round(W / zoom / 2) * 2); h = int(round(w * 16 / 9 / 2) * 2)
dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-r", "24", "-i", "-",
                        "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-preset", "faster", "-crf", "12", "-pix_fmt", "yuv420p",
                        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", out + ".part.mp4"],
                       stdin=subprocess.PIPE)
n = 0; fs = W * H * 3
while True:
    buf = dec.stdout.read(fs)
    if len(buf) < fs: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
    i = min(n, len(sx) - 1)
    x0 = int(np.clip(sx[i] - w / 2, 0, W - w)); y0 = int(np.clip(sy[i] - h * 0.54, 0, H - h))   # ring a little below centre: room for text
    enc.stdin.write(np.ascontiguousarray(f[y0:y0 + h, x0:x0 + w]).tobytes()); n += 1
enc.stdin.close(); enc.wait(); dec.wait()
import os; os.replace(out + ".part.mp4", out)
print(out, n, "frames, crop", w, "x", h)
