"""Aperçu rapide de la tête (sans Cycles) : triangles ombrés, vue de face, de côté et de dessus, pour juger les griffes."""
import sys, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import load3dm, finish as FIN
from PIL import Image, ImageDraw
def view(path, style=None, S=420, layers=None, shape=None):
    P = load3dm.load(path, layers)
    if shape:
        import reshape; reshape.reshape(P, shape)
    big = max(P['gems'], key=lambda x: np.ptp(x['V'], 0).max()); f = FIN.gem_frame(big['V'])
    if style: FIN.finish(P['metal'], P['gems'], prong_style=style)
    c, h = f['c'], f['h']; _, _, Wv = np.linalg.svd(big['V'] - c); e1 = Wv[0] - (Wv[0] @ h) * h; e1 /= np.linalg.norm(e1); e2 = np.cross(h, e1)
    span = 1.25 * f['R'] + 1.2
    tris = []
    for kind in ('metal', 'gems'):
        for x in P[kind]:
            V, F = x['V'], x['F']
            if not len(F): continue
            T = V[F]; m = T.mean(1) - c
            keep = (np.abs(m @ e1) < span) & (np.abs(m @ e2) < span) & ((m @ h) > f['girdle'] - 1.8) & ((m @ h) < f['top'] + 3)
            tris.append((T[keep], kind))
    ims = []
    for vx, vy, vz in ((e1, h, e2), (e2, h, -e1), (e1, e2, h)):  # face (regard selon e2), côté, dessus
        im = Image.new('RGB', (S, S), (250, 250, 250)); d = ImageDraw.Draw(im); allT = []
        for T, kind in tris:
            if not len(T): continue
            n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
            L = (0.35 * vx + 0.6 * vy + 0.7 * vz); L /= np.linalg.norm(L)
            sh = np.abs(n @ L); z = ((T - c) @ vz).mean(1)
            for t, s_, zz in zip(T, sh, z): allT.append((zz, t, s_, kind))
        allT.sort(key=lambda a: a[0])
        sc = S / (2 * span)
        for zz, t, s_, kind in allT:
            xy = [(S / 2 + ((p - c) @ vx) * sc, S / 2 - ((p - c) @ vy - (f['girdle'] + 0.6 if vy is h else 0)) * sc) for p in t]
            g = int(60 + 190 * s_)
            col = (g, g, g) if kind == 'metal' else (int(150 + 60 * s_), int(190 + 50 * s_), 255)
            d.polygon(xy, fill=col)
        ims.append(im)
    out = Image.new('RGB', (3 * S, S)); [out.paste(im, (i * S, 0)) for i, im in enumerate(ims)]
    return out
if __name__ == '__main__':
    path, out = sys.argv[1], sys.argv[2]; styles = sys.argv[3].split(',') if len(sys.argv) > 3 else ['-']
    rows = [view(path, None if s == '-' else s) for s in styles]
    O = Image.new('RGB', (rows[0].width, rows[0].height * len(rows)))
    for i, r in enumerate(rows): O.paste(r, (0, i * r.height))
    O.save(out, quality=88)
