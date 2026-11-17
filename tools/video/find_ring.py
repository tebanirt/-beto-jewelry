"""Ring centre (bright pixels) in the graded 4K clip at given times -> source pixel coords (2160x3840)."""
import subprocess, sys, numpy as np
P = "assets/C015_grade.mp4"
for t in [float(x) for x in sys.argv[1:]]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", P, "-frames:v", "1", "-vf", "scale=540:960,format=gray",
                          "-f", "rawvideo", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(960, 540).astype(float)
    a[:330] = 0                                  # ignore the bright backdrop at the top
    m = a > 215
    ys, xs = np.nonzero(m)
    if len(xs) < 20:
        print(t, "no ring"); continue
    x0, x1, y0, y1 = np.percentile(xs, 2), np.percentile(xs, 98), np.percentile(ys, 2), np.percentile(ys, 98)
    print(f"{t:5.1f}  cx={int((x0+x1)/2*4)} cy={int((y0+y1)/2*4)}  w={int((x1-x0)*4)} h={int((y1-y0)*4)}")
