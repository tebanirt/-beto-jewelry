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
    # déformation de la tête
    head_lo = fr['bot'] - 0.9 * src_pav  # sous le culet : la tige du panier se fond dans le jonc
    def warp(V):
        uu, vv, pp = local(V)
        th = np.arctan2(vv, uu); rr = np.hypot(uu, vv)
        rs = Rs(th); rt = Rt(th)
        wp = np.clip((pp - head_lo) / max(0.6 * src_pav, 1e-6), 0, 1); wp = wp * wp * (3 - 2 * wp)
        x = (rr / rs - 1.25) / 0.6; wr = 1 - np.clip(x, 0, 1); wr = wr * wr * (3 - 2 * wr)
        wgt = wp * wr
        if not np.any(wgt > 1e-4): return None
        fac = 1 + wgt * (rt / rs - 1)
        below = pp < fr['girdle']
        pp2 = np.where(below, fr['girdle'] - (fr['girdle'] - pp) * (1 + wgt * (k_pav - 1)), pp)
        return c + np.outer(uu * fac, l) + np.outer(vv * fac, w) + np.outer(pp2, h)
    for part in parts['metal']:
        V2 = warp(part['V'])
        if V2 is None: continue
        part['V'] = V2; part['N'] = None; part['resharp'] = True
    # petites pierres de la tête (halo caché, pierres de la galerie) : déplacées d'un bloc avec le métal qui les tient
    for g in gems:
        if g is big: continue
        ctr = g['V'].mean(0)[None]; ctr2 = warp(ctr)
        if ctr2 is not None: g['V'] = g['V'] + (ctr2 - ctr)
    # pierre posée au même rondiste
    newV = c + np.outer(G[:, 1], l) + np.outer(G[:, 0], w) + np.outer(G[:, 2] + fr['girdle'], h)
    F = GF  # orientation : volume signé positif
    a_, b_, d_ = newV[F[:, 0]], newV[F[:, 1]], newV[F[:, 2]]
    if np.einsum('ij,ij->i', a_, np.cross(b_, d_)).sum() < 0: F = F[:, ::-1]
    big['V'], big['F'], big['N'] = newV, F, None
    return dict(L=L, W=Wd, k_pav=k_pav)
