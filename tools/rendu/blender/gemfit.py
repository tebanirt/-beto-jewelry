"""Cherche les réglages de retouche des pierres les plus proches de la pierre de référence (mesures gemstats)."""
import sys, itertools, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import gempost, gemstats
from PIL import Image
raw, mask, box = sys.argv[1], sys.argv[2], tuple(map(float, sys.argv[3].split(',')))
ref = gemstats.stats(sys.argv[4]) if len(sys.argv) > 4 else {'noir': 0.023, 'blanc': 0.501, 'ecart': 0.187, 'detail': 0.101, 'moyenne': 0.799}
W = {'noir': 4, 'blanc': 2, 'ecart': 3, 'detail': 3, 'moyenne': 3}
def comp(src, dst):
    im = Image.open(src).convert('RGBA'); b = Image.new('RGBA', im.size, (250, 250, 250, 255)); Image.alpha_composite(b, im).convert('RGB').save(dst)
best = []
tmp = raw.replace('_raw.png', '_fit.png')
for b, w, g, s in itertools.product((0.08, 0.15, 0.22, 0.30), (0.55, 0.62, 0.70, 0.78), (0.7, 0.85, 1.0), (0.0, 0.4, 0.8)):
    if w - b < 0.3: continue
    gempost.apply(raw, mask, tmp, b, w, g, s, 0.7); comp(tmp, tmp)
    st = gemstats.stats(tmp, box)
    err = sum(W[k] * ((st[k] - ref[k]) / max(ref[k], 0.05)) ** 2 for k in W)
    best.append((err, (b, w, g, s), st))
best.sort(key=lambda x: x[0])
for e, p, st in best[:5]: print(round(e, 3), p, st)
