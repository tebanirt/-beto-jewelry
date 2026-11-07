"""Adapte la tête d'un design de Rayane à une autre forme de pierre (et à un autre carat).

La tête (griffes, panier, galerie, halo caché) est déformée selon le contour de la nouvelle pierre :
à chaque angle autour de l'axe de la pierre, le métal s'écarte ou se rapproche dans le rapport des deux contours ;
la hauteur sous le rondiste suit la profondeur du pavillon. Le jonc, loin de la tête, n'est pas touché.
La nouvelle pierre est une taille exacte (gems.py), posée au même rondiste que l'originale.
"""
import numpy as np
from scipy.spatial import ConvexHull
import gems as GM
import finish as FIN

# carats = L x l x profondeur (mm) x facteur (usage du métier), profondeur relative à la largeur selon gems.py
CT_FACTOR = {'rond': 0.0061, 'ovale': 0.0062, 'coussin': 0.00815, 'poire': 0.0059, 'marquise': 0.0058,
             'emeraude': 0.0089, 'princesse': 0.0083, 'radiant': 0.0081}


def dims_for_carat(shape, ct):
    V, _ = GM.gem(shape); L0, W0, D0 = np.ptp(V, 0)[[1, 0, 2]]
    rw, rd = W0 / L0, D0 / W0  # largeur/longueur, profondeur/largeur
    L = (ct / (CT_FACTOR[shape] * rw * rw * rd)) ** (1 / 3)
    if shape == 'rond':  # facteur d'usage défini sur le diamètre
        L = (ct / (CT_FACTOR[shape] * rd)) ** (1 / 3)
    return L, L * rw  # longueur, largeur (mm)


def frame(V, finger_axis=np.array([0.0, 1.0, 0.0])):
    """Repère de la pierre : centre, h (vers le haut), l (longueur), w (largeur), rondiste, haut, bas."""
    f = FIN.gem_frame(V); c, h = f['c'], f['h']
    d = V - c; pl = d - np.outer(d @ h, h)
    _, s, W = np.linalg.svd(pl, full_matrices=False); l = W[0]
    e0, e1 = np.ptp(pl @ W[0]), np.ptp(pl @ W[1])
    if e1 > e0: l = W[1]; e0, e1 = e1, e0
    if e0 < 1.05 * e1:  # pierre ronde ou carrée : la longueur suit le doigt
        l = finger_axis - (finger_axis @ h) * h
    l = l / np.linalg.norm(l)
    if l @ finger_axis < 0: l = -l
    w = np.cross(h, l)
    return dict(c=c, h=h, l=l, w=w, girdle=f['girdle'], top=f['top'], bot=f['bot'])


def outline_fn(P2):
    """Contour (enveloppe convexe des points projetés) -> fonction rayon(angle)."""
    hull = P2[ConvexHull(P2).vertices]
    E = np.roll(hull, -1, 0) - hull
    def r(theta):
        theta = np.atleast_1d(theta); d = np.stack([np.cos(theta), np.sin(theta)], 1)
        best = np.full(len(theta), np.inf)
        for a, e in zip(hull, E):  # intersection rayon / arête : t*d = a + s*e
            det = d[:, 0] * (-e[1]) - d[:, 1] * (-e[0])
            ok = np.abs(det) > 1e-12
            t = np.where(ok, (a[0] * (-e[1]) - a[1] * (-e[0])) / np.where(ok, det, 1), np.inf)
            s = np.where(ok, (d[:, 0] * a[1] - d[:, 1] * a[0]) / np.where(ok, det, 1), -1)
            hit = ok & (t > 0) & (s >= -1e-9) & (s <= 1 + 1e-9)
            best = np.where(hit & (t < best), t, best)
        return best
    return r


def _wrap(a): return (a + np.pi) % (2 * np.pi) - np.pi


def prong_angles(metal, local, Rs, fr):
    """Angles des griffes de la tête d'origine : métal au-dessus du rondiste, près du contour de la pierre."""
    A = []
    for part in metal:
        uu, vv, pp = local(part['V'])
        th = np.arctan2(vv, uu); rr = np.hypot(uu, vv); rs = Rs(th)
        sel = (pp > fr['girdle'] + 0.25 * (fr['top'] - fr['girdle'])) & (rr > 0.7 * rs) & (rr < 1.4 * rs)
        A.append(th[sel])
    A = np.concatenate(A) if A else np.zeros(0)
    if len(A) < 8: return []
    hist = np.bincount(((np.degrees(A) % 360) // 2).astype(int), minlength=180)
    occ = hist > max(2, 0.004 * len(A))
    if occ.all() or not occ.any(): return []
    k0 = int(np.argmin(occ))  # départ sur un intervalle vide : les groupes ne sont pas coupés en deux
    order = [(k0 + k) % 180 for k in range(180)]; groups, cur, gap = [], [], 0
    for b in order:
        if occ[b]: cur.append(b); gap = 0
        else:
            gap += 1
            if cur and gap > 3: groups.append(cur); cur = []
    if cur: groups.append(cur)
    out = []
    for g in groups:
        wgt = hist[g].astype(float)
        if wgt.sum() < 0.03 * len(A): continue
        ang = np.radians(np.array(g) * 2 + 1); out.append(float(np.arctan2((wgt * np.sin(ang)).sum(), (wgt * np.cos(ang)).sum())))
    return sorted(out)


def target_angles(shape, src, L, W):
    """Où le métier place les griffes pour cette forme. Renvoie (angles cibles des griffes existantes, griffes ajoutées)."""
    n = len(src); src = np.array(src); extra = []
    if n == 4:
        if shape in ('princesse', 'emeraude', 'radiant', 'coussin'):
            a = np.arctan2(W / 2, L / 2); tgt = np.where(np.abs(src) < np.pi / 2, a, np.pi - a) * np.sign(src)
        elif shape == 'marquise':  # 6 griffes : une à chaque pointe, quatre sur les flancs
            tgt = np.where(np.abs(src) < np.pi / 2, np.radians(58), np.radians(122)) * np.sign(src); extra = [0.0, np.pi]
        elif shape == 'poire':  # 5 griffes : une à la pointe, deux aux épaules, deux au bout arrondi
            tgt = np.where(np.abs(src) < np.pi / 2, np.radians(68), np.abs(src)) * np.sign(src); extra = [0.0]
        else: return src, []
    elif n == 6 and shape in ('marquise', 'poire'):
        tgt = src.copy(); k0 = int(np.argmin(np.abs(_wrap(src)))); tgt[k0] = 0
        if shape == 'marquise': k1 = int(np.argmin(np.abs(_wrap(src - np.pi)))); tgt[k1] = np.pi
    else: return src, []
    return np.array([_wrap(t) for t in tgt]), extra


def prong_parts(metal, local, ang, fr):
    """Morceaux de métal qui forment une griffe (angle donné) : étroits autour de cet angle, montant au-dessus du rondiste."""
    out = []
    for part in metal:
        uu, vv, pp = local(part['V']); th = np.arctan2(vv, uu); d = _wrap(th - ang)
        if np.abs(d).max() < np.radians(28) and pp.max() > fr['girdle'] and pp.min() > fr['bot'] - 2.5 * (fr['girdle'] - fr['bot']):
            out.append(part)
    return out


def reshape(parts, shape, ct=None, dims=None, rotate_deg=0.0):
    """parts = load3dm.load(...) ; remplace la pierre centrale par `shape` et déforme la tête. Modifie sur place."""
    gems = parts['gems']; big = max(gems, key=lambda x: np.ptp(x['V'], 0).max())
    fr = frame(big['V']); c, h, l, w = fr['c'], fr['h'], fr['l'], fr['w']
    def local(V):
        d = V - c; return d @ l, d @ w, d @ h
    u, v, p = local(big['V'])
    Rs = outline_fn(np.c_[u, v])
    src_pav = fr['girdle'] - fr['bot']
    # nouvelle pierre
    G, GF = GM.gem(shape); G = G.copy()
    if dims is None: dims = dims_for_carat(shape, ct)
    L, Wd = dims
    sW = Wd / np.ptp(G[:, 0]); G[:, 1] *= L / np.ptp(G[:, 1]); G[:, 0] *= sW; G[:, 2] *= sW  # hauteur : proportions du métier
    if rotate_deg:
        a = np.radians(rotate_deg); Rz = np.array([[np.cos(a), -np.sin(a), 0], [np.sin(a), np.cos(a), 0], [0, 0, 1]])
        G = G @ Rz.T
    Rt = outline_fn(G[:, [1, 0]])  # (u = longueur, v = largeur)
    tgt_pav = -G[:, 2].min()
    k_pav = tgt_pav / max(src_pav, 1e-6)
    # griffes déplacées vers leur place pour la nouvelle forme (chaque griffe tourne d'un bloc, l'écart absorbe le reste)
    src_a = prong_angles(parts['metal'], local, Rs, fr)
    tgt_a, extra = target_angles(shape, src_a, L, Wd) if len(src_a) else ([], [])
    added = []
    for ea in extra:  # griffe ajoutée : copie d'une vraie griffe de la tête, tournée jusqu'à la pointe
        k = int(np.argmin(np.abs(_wrap(np.array(src_a) - ea)))); rot = _wrap(ea - src_a[k])
        # copie symétrique (miroir par rapport à l'axe de la griffe d'origine) pour une griffe de pointe bien centrée
        for part in prong_parts(parts['metal'], local, src_a[k], fr):
            uu, vv, pp = local(part['V']); th = np.arctan2(vv, uu); rr = np.hypot(uu, vv)
            th2 = th + rot
            V2 = c + np.outer(rr * np.cos(th2), l) + np.outer(rr * np.sin(th2), w) + np.outer(pp, h)
            added.append({'V': V2, 'F': part['F'].copy(), 'N': None, 'layer': part['layer'], 'resharp': True, 'added': True})
    offs = [_wrap(t - s_) for s_, t in zip(src_a, tgt_a)]
    if len(src_a) > 1:
        sa = np.array(src_a); gaps = np.diff(np.r_[np.sort(sa), np.sort(sa)[0] + 2 * np.pi]); sig = 0.45 * gaps.min()
    def ang_offset(th):
        if not len(src_a) or max(abs(o) for o in offs) < 1e-3: return np.zeros_like(th)
        W_ = np.stack([np.exp(-(np.abs(_wrap(th - s_)) / sig) ** 4) + 1e-9 for s_ in src_a]); return (W_ * np.array(offs)[:, None]).sum(0) / W_.sum(0)
    # déformation de la tête
    head_lo = fr['bot'] - 0.9 * src_pav  # sous le culet : la tige du panier se fond dans le jonc
    def warp(V, fixed_angle=False):
        uu, vv, pp = local(V)
        th = np.arctan2(vv, uu); rr = np.hypot(uu, vv)
        rs = Rs(th); rt = Rt(th)
        wp = np.clip((pp - head_lo) / max(0.6 * src_pav, 1e-6), 0, 1); wp = wp * wp * (3 - 2 * wp)
        x = (rr / rs - 1.25) / 0.6; wr = 1 - np.clip(x, 0, 1); wr = wr * wr * (3 - 2 * wr)
        wgt = wp * wr
        if not np.any(wgt > 1e-4): return None
        th2 = th if fixed_angle else th + wgt * ang_offset(th)
        rr2 = rr * (1 + wgt * (Rt(th2) / rs - 1))
        below = pp < fr['girdle']
        pp2 = np.where(below, fr['girdle'] - (fr['girdle'] - pp) * (1 + wgt * (k_pav - 1)), pp)
        return c + np.outer(rr2 * np.cos(th2), l) + np.outer(rr2 * np.sin(th2), w) + np.outer(pp2, h)
    parts['metal'].extend(added)
    for part in parts['metal']:
        V2 = warp(part['V'], fixed_angle=part.get('added', False))
        if V2 is None: continue
        part['V'] = V2; part['N'] = None; part['resharp'] = True
    # petites pierres de la tête (halo caché, pierres de la galerie) : déplacées d'un bloc avec le métal qui les tient
    for g in gems:
        if g is big: continue
        ctr = g['V'].mean(0)[None]; ctr2 = warp(ctr)
        if ctr2 is not None: g['V'] = g['V'] + (ctr2 - ctr)
    # petites pierres qui se chevauchent après déplacement, ou qui touchent une griffe ajoutée : retirées
    if added or extra:
        from scipy.spatial import cKDTree
        pts = np.vstack([p_['V'] for p_ in parts['metal'] if p_.get('added')]) if added else np.zeros((0, 3))
        tree = cKDTree(pts) if len(pts) else None
        keep, kept_c = [], []
        for g in sorted(gems, key=lambda x: -np.ptp(x['V'], 0).max()):
            if g is big: keep.append(g); continue
            cg = g['V'].mean(0); rg = 0.5 * float(np.ptp(g['V'], 0).max())
            if any(np.linalg.norm(cg - c2) < 0.9 * (rg + r2) for c2, r2 in kept_c): continue
            if tree is not None and tree.query(cg)[0] < 0.8 * rg: continue
            keep.append(g); kept_c.append((cg, rg))
        parts['gems'][:] = keep
    # pierre posée au même rondiste
    newV = c + np.outer(G[:, 1], l) + np.outer(G[:, 0], w) + np.outer(G[:, 2] + fr['girdle'], h)
    F = GF  # orientation : volume signé positif
    a_, b_, d_ = newV[F[:, 0]], newV[F[:, 1]], newV[F[:, 2]]
    if np.einsum('ij,ij->i', a_, np.cross(b_, d_)).sum() < 0: F = F[:, ::-1]
    big['V'], big['F'], big['N'] = newV, F, None
    return dict(L=L, W=Wd, k_pav=k_pav, griffes=[round(float(np.degrees(a)), 1) for a in src_a], vers=[round(float(np.degrees(a)), 1) for a in tgt_a], ajoutees=[round(float(np.degrees(a)), 1) for a in extra], pierres=len(parts['gems']))
