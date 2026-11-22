"""Gros plan d'une griffe (vue de côté radiale + dessus) pour plusieurs réglages : diagnostic rapide sans Cycles."""
import sys, os, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import load3dm, finish as FIN
from PIL import Image, ImageDraw
A0 = {}
def tile(path, style, force=None, S=380, which=0):
    if force: os.environ['BETO_PRONG_FORCE'] = force
    else: os.environ.pop('BETO_PRONG_FORCE', None)
    P = load3dm.load(path); big = max(P['gems'], key=lambda x: np.ptp(x['V'], 0).max()); f = FIN.gem_frame(big['V'])
    if style: FIN.finish(P['metal'], P['gems'], prong_style=style)
    c, h = f['c'], f['h']
    # griffe choisie : point de métal le plus haut près de la pierre
    allm = np.vstack([x['V'][np.unique(x['F'])] for x in P['metal'] if len(x['F'])]); d = allm - c; p = d @ h
    dp = d - np.outer(p, h); rr = np.linalg.norm(dp, 1) if False else np.linalg.norm(dp, axis=1)
    cand = (rr < f['R'] * 1.35 + 0.9) & (p > f['girdle'])
    ang = np.arctan2(dp[cand] @ np.cross(h, [1, 0, 0]), dp[cand] @ np.array([1, 0, 0]))
    a0 = A0.setdefault(path, float(ang[np.argmax(p[cand])]))
    u = np.cos(a0) * np.array([1, 0, 0]) + np.sin(a0) * np.cross(h, [1, 0, 0]); u -= (u @ h) * h; u /= np.linalg.norm(u); w = np.cross(h, u)
    ctr = c + u * (f['Rfun'](u[None])[0]) + h * (f['girdle'] + 0.4)
    ims = []
    for vx, vy, vz in ((u, h, w), (w, h, -u), (u, w, h)):
        im = Image.new('RGB', (S, S), (250, 250, 250)); dr = ImageDraw.Draw(im); allT = []
        for kind in ('metal', 'gems'):
            for x in P[kind]:
                if not len(x['F']): continue
                T = x['V'][x['F']]; m = T.mean(1) - ctr
                keep = (np.abs(m @ u) < 2.2) & (np.abs(m @ w) < 2.2) & (np.abs(m @ h) < 2.2)
                T = T[keep]
                if not len(T): continue
                n = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]); n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
                L = 0.4 * vx + 0.6 * vy + 0.7 * vz; L /= np.linalg.norm(L); sh = np.abs(n @ L); z = ((T - ctr) @ vz).mean(1)
                allT += [(zz, t, s_, kind) for zz, t, s_ in zip(z, T, sh)]
        allT.sort(key=lambda a: a[0]); sc = S / 4.4
        for zz, t, s_, kind in allT:
            xy = [(S / 2 + ((q - ctr) @ vx) * sc, S / 2 - ((q - ctr) @ vy) * sc) for q in t]; g = int(60 + 190 * s_)
            dr.polygon(xy, fill=(g, g, g) if kind == 'metal' else (int(150 + 60 * s_), int(190 + 50 * s_), 255))
        ims.append(im)
    out = Image.new('RGB', (3 * S, S)); [out.paste(im, (i * S, 0)) for i, im in enumerate(ims)]
    nt = sum(1 for x in P['metal'] if x.get('layer') == 'talon')
    ImageDraw.Draw(out).text((6, 6), f"{style} {force or ''} becs {nt}", fill=(200, 0, 0)); return out
if __name__ == '__main__':
    path, out = sys.argv[1], sys.argv[2]; rows = []
    for spec in sys.argv[3:]:
        st, _, fo = spec.partition(':'); rows.append(tile(path, None if st == '-' else st, fo or None))
    O = Image.new('RGB', (rows[0].width, rows[0].height * len(rows)))
    for i, r in enumerate(rows): O.paste(r, (0, i * r.height))
    O.save(out, quality=88)
