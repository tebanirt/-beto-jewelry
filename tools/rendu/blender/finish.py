"""Finition automatique d'un design préparé pour le sertissage : griffes et grains coupés au-dessus de chaque pierre, bouts arrondis."""
import numpy as np
from scipy.cluster.hierarchy import fcluster, linkage

def gem_frame(V):
    c = V.mean(0); _, _, W = np.linalg.svd(V - c, full_matrices=False)
    ext = np.ptp((V - c) @ W.T, 0); h = W[int(np.argmin(ext))]
    p = (V - c) @ h; r = np.linalg.norm((V - c) - np.outer(p, h), axis=1)
    g = p[np.argmax(r)]; top, bot = p.max(), p.min()
    if (top - g) > (g - bot): h, p, g, top, bot = -h, -p, -g, -bot, -top
    e1 = W[int(np.argmax(ext))]; e1 = e1 - (e1 @ h) * h; e1 /= np.linalg.norm(e1); e2 = np.cross(h, e1)
    # contour de la pierre (rayon selon l'angle) : une pierre allongée n'a pas une zone ronde
    ang = np.arctan2((V - c) @ e2, (V - c) @ e1); bins = ((ang + np.pi) / (2 * np.pi) * 72).astype(int) % 72
    rb = np.zeros(72); np.maximum.at(rb, bins, r)
    for _ in range(3): rb = np.where(rb > 0, rb, np.maximum(np.roll(rb, 1), np.roll(rb, -1)))
    rb = np.maximum(rb, np.maximum(np.roll(rb, 1), np.roll(rb, -1)))  # un peu plus large que les sommets (arêtes entre sommets)
    def Rfun(dv):
        a = np.arctan2(dv @ e2, dv @ e1); return rb[((a + np.pi) / (2 * np.pi) * 72).astype(int) % 72]
    Rw = float(np.percentile(rb, 5)); Rm = float(np.sqrt(r.max() * Rw))
    return dict(c=c, h=h, girdle=g, top=top, bot=bot, R=float(r.max()), Rw=Rw, Rm=Rm, Rfun=Rfun, crown=float(top - g))

def _clusters(M, eps):
    """Groupes de points distants de moins de eps (liaison simple), mémoire linéaire : grille puis composantes connexes."""
    from scipy.spatial import cKDTree
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    key = np.floor(M / (eps / 2.5)).astype(np.int64)
    _, rep, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    Q = M[rep]; pairs = cKDTree(Q).query_pairs(eps, output_type='ndarray')
    n = len(Q)
    if len(pairs) == 0: lab = np.arange(n)
    else:
        A = coo_matrix((np.ones(len(pairs)), (pairs[:, 0], pairs[:, 1])), shape=(n, n))
        _, lab = connected_components(A, directed=False)
    return lab[inv.ravel()] + 1


def finish(metal, gems, tip=0.38, cyl=1.22, min_gem=0.6, bend=0.42):
    """Modifie les maillages métal sur place ; renvoie la liste des bouts arrondis (centre, rayon)."""
    caps = []
    from scipy.spatial import ConvexHull
    big_gems = [gm for gm in gems if np.ptp(gm['V'], 0).max() >= min_gem]
    frames = [gem_frame(gm['V']) for gm in big_gems]
    for f, gm in zip(frames, big_gems):
        c, h, R = f['c'], f['h'], f['R']
        zc = f['girdle'] + tip * f['crown']
        moved = []
        for part in metal:
            V = part['V']; d = V - c; p = d @ h
            radial = np.linalg.norm(d - np.outer(p, h), axis=1)
            # zone limitée : autour de la pierre et jusqu'à une hauteur raisonnable de griffe (jamais à travers la bague)
            reach = f['top'] + max(1.2, 0.9 * f['Rw'])
            Rth = f['Rfun'](d - np.outer(p, h)) if R >= 1.5 else R  # grande pierre : la zone suit son contour
            near = (radial <= Rth * (cyl + (0.13 if f['Rm'] > 2 else 0.0)) + 0.25) & (p <= reach) & (p >= f['bot'])
            if R < 1.5:  # tige de sertissage longue d'une petite pierre : seulement une petite pièce isolée (jamais une griffe de la tête)
                ex = np.sort(np.ptp(V, 0))[::-1]; pin = ex[0] < 4.0 and ex[0] > 2.0 * ex[1]  # tige : petite pièce longue et fine
                if pin and np.linalg.norm(V.mean(0) - c) < 2.5 * R + 0.5:
                    near = near | ((radial <= 2.0 * R + 0.4) & (p >= f['bot'] - 1.5) & (p <= f['top'] + max(3.0, 1.5 * R)))
            # griffe rabattue sur la couronne : au-dessus du rondiste, le métal se rapproche de l'axe de la pierre
            up = near & (p > f['girdle'])
            if near.any(): part['N'] = None; part['resharp'] = True  # normales recalculées (sinon ombrage taché)
            if up.any():
                rdir = d[up] - np.outer(p[up], h); rn = np.linalg.norm(rdir, axis=1, keepdims=True); rdir = rdir / np.maximum(rn, 1e-9)
                shift = np.minimum(bend * (p[up] - f['girdle']), 0.35 * f['crown'] + 0.05)
                V[up] -= rdir * shift[:, None]
            d = V - c; p = d @ h
            sel = near & (p > zc)
            if not sel.any(): continue
            V[sel] -= np.outer(p[sel] - zc, h)  # coupe au niveau du bout de griffe
            moved.append(V[sel].copy())
        # jamais de métal dans la pierre : un point entré dans la pierre est ramené à sa surface (+ 0,02 mm)
        try: H = np.unique(np.round(ConvexHull(gm['V']).equations, 6), axis=0)  # faces coplanaires fusionnées
        except Exception:
            try: H = ConvexHull(gm['V'], qhull_options='QJ').equations
            except Exception: H = None  # pierre au maillage plat : rien à repousser
        lo_, hi_ = gm['V'].min(0) - 0.05, gm['V'].max(0) + 0.05
        for part in (metal if H is not None else []):
            V = part['V']; box = np.all((V >= lo_) & (V <= hi_), axis=1)
            if not box.any(): continue
            idx = np.where(box)[0]; moved_any = False; deep = []
            for s0 in range(0, len(idx), 8000):  # par paquets : mémoire bornée même pour une tête très détaillée
                ch = idx[s0:s0 + 8000]; d = V[ch] @ H[:, :3].T + H[:, 3]
                inside = np.all(d < -0.02, axis=1)
                if not inside.any(): continue
                ii = ch[inside]; dd = d[inside]; k = np.argmax(dd, axis=1); depth = -dd[np.arange(len(ii)), k]
                sh = depth < 0.3  # contact : métal ramené à la surface de la pierre
                V[ii[sh]] += H[k[sh], :3] * (depth[sh] + 0.02)[:, None]; deep.append(ii[~sh]); moved_any = True
            if moved_any: part['N'] = None; part['resharp'] = True
            deep = np.concatenate(deep) if deep else np.zeros(0, int)
            if len(deep):  # métal enfoui dans la pierre : retiré, comme le siège creusé par le sertisseur
                kill = np.zeros(len(V), bool); kill[deep] = True
                part['F'] = part['F'][~kill[part['F']].any(axis=1)]
        if not moved: continue
        M = np.vstack(moved)
        if len(M) == 1: groups = np.array([1])
        else:
            eps = max(0.06, 0.15 * f['Rm'])
            groups = _clusters(M, eps)
        for gid in np.unique(groups):
            P = M[groups == gid]
            if len(P) < 3: continue
            ctr = P.mean(0); rad = float(np.linalg.norm(P - ctr, axis=1).max())
            if R < 1.5: rad = min(max(1.1 * rad, 0.08), 0.42 * R)  # grain du pavé : bille qui couvre tout le bout coupé
            else: rad = min(max(rad, 0.06), 0.16 * f['Rm'] + 0.15)
            caps.append((ctr - h * 0.45 * rad, rad))
    return caps
