"""Mesures des griffes de la pierre centrale (sans rendu) : diamètre, hauteur au-dessus du rondiste, avance sur la couronne."""
import sys, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import load3dm, finish as FIN
def stats(path, style=None, layers=None):
    P = load3dm.load(path, layers)
    gems = sorted(P['gems'], key=lambda g: -np.ptp(g['V'], 0).max()); gm = gems[0]
    f = FIN.gem_frame(gm['V'])
    if style: FIN.finish(P['metal'], P['gems'], prong_style=style)
    c, h = f['c'], f['h']
    pts = []
    for part in P['metal']:
        V = part['V'][np.unique(part['F'])] if len(part['F']) else part['V'][:0]
        d = V - c; p = d @ h; rad = np.linalg.norm(d - np.outer(p, h), axis=1); Rth = f['Rfun'](d - np.outer(p, h))
        sel = (p > f['girdle'] + 0.05) & (rad <= Rth * 1.35 + 0.9) & (p < f['top'] + 4)
        pts.append(V[sel])
    M = np.vstack(pts); lab = FIN._clusters(M, 0.3)
    out = []
    for k in np.unique(lab):
        Q = M[lab == k]
        if len(Q) < 20: continue
        d = Q - c; q = d @ h - f['girdle']; o = d - np.outer(d @ h, h)
        ctr = o.mean(0); u = ctr / max(np.linalg.norm(ctr), 1e-9); w = np.cross(h, u)
        lo = q < min(0.35, 0.3 * q.max())
        width = np.ptp(o[lo] @ w) if lo.sum() > 3 else np.nan; depth = np.ptp(o[lo] @ u) if lo.sum() > 3 else np.nan
        ins = f['Rfun'](o) - np.linalg.norm(o, axis=1); hi = q > 0.5 * q.max()
        top = q > 0.75 * q.max(); wt = np.ptp(o[top] @ w) if top.sum() > 3 else np.nan
        out.append((q.max(), width, depth, ins[hi].max(), wt))
    D = 2 * f['R']
    print(f"{path.rsplit('/',1)[-1][:40]:40s} style={style} pierre {2*f['R']:.2f}x{2*f['Rw']:.2f} couronne {f['crown']:.2f}  griffes {len(out)}")
    for qm, wd, dp, cov, wt in sorted(out, key=lambda x: -x[0])[:8]:
        print(f"   haut {qm:5.2f}  larg base {wd:5.2f} bout {wt:5.2f}  prof {dp:5.2f}  avance (moitié haute) {cov:5.2f}")
if __name__ == '__main__':
    stats(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != '-' else None)
