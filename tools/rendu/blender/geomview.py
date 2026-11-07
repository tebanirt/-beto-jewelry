"""Aperçu géométrique rapide (dessus / face / côté) d'un design, éventuellement adapté à une autre forme."""
import sys, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import load3dm, reshape
from PIL import Image, ImageDraw
path, out = sys.argv[1], sys.argv[2]; shape = sys.argv[3] if len(sys.argv) > 3 else None; ct = float(sys.argv[4]) if len(sys.argv) > 4 else 2.0
P = load3dm.load(path)
if shape: print(reshape.reshape(P, shape, ct=ct))
S = 330; im = Image.new('RGB', (3 * S, S), 'white'); d = ImageDraw.Draw(im)
big = max(P['gems'], key=lambda x: np.ptp(x['V'], 0).max()); c = big['V'].mean(0)
for k, (i, j) in enumerate(((0, 1), (0, 2), (1, 2))):
    for kind, col in (('metal', (0, 0, 0)), ('gems', (0, 120, 255))):
        for x in P[kind]:
            V = x['V'] - c; sc = S / 26.0
            if k == 0: V = V[V[:, 2] > -3]
            for a, b in zip(V[::3, i], V[::3, j]): d.point((S * k + S / 2 + a * sc, S / 2 - b * sc), fill=col)
im.save(out)
