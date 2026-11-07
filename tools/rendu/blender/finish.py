"""Finition automatique d'un design préparé pour le sertissage : griffes et grains coupés au-dessus de chaque pierre, bouts arrondis."""
import numpy as np, os as _os
from scipy.cluster.hierarchy import fcluster, linkage

def gem_frame(V):
    c = V.mean(0); _, _, W = np.linalg.svd(V - c, full_matrices=False)
    ext = np.ptp((V - c) @ W.T, 0); h = W[int(np.argmin(ext))]
    p = (V - c) @ h; r = np.linalg.norm((V - c) - np.outer(p, h), axis=1)
    g = p[np.argmax(r)]; top, bot = p.max(), p.min()
    if (top - g) > (g - bot): h, p, g, top, bot = -h, -p, -g, -bot, -top
    e1 = W[int(np.argmax(ext))]; e1 = e1 - (e1 @ h) * h; e1 /= np.linalg.norm(e1); e2 = np.cross(h, e1)
    # contour de la pierre (rayon selon l'angle) : une pierre allongée n'a pas une zone ronde
    P2 = np.c_[(V - c) @ e1, (V - c) @ e2]
    try:
        from scipy.spatial import ConvexHull
        hv = P2[ConvexHull(P2).vertices]; nxt = np.roll(hv, -1, 0)
        t = np.linspace(0, 1, 40, endpoint=False)[:, None, None]
        P2 = (hv[None] * (1 - t) + nxt[None] * t).reshape(-1, 2)  # contour suivi le long des arêtes (tailles à degrés : peu de sommets)
    except Exception: pass
    ang = np.arctan2(P2[:, 1], P2[:, 0]); bins = ((ang + np.pi) / (2 * np.pi) * 72).astype(int) % 72
    rb = np.zeros(72); np.maximum.at(rb, bins, np.hypot(P2[:, 0], P2[:, 1]))
    for _ in range(6): rb = np.where(rb > 0, rb, np.maximum(np.roll(rb, 1), np.roll(rb, -1)))
    rb = np.maximum(rb, np.maximum(np.roll(rb, 1), np.roll(rb, -1)))  # un peu plus large (entre deux tranches)
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


def _span_deg(o, h):
    """Étendue angulaire (degrés) de points autour de l'axe de la pierre : petite pour une griffe, ~360 pour un serti clos."""
    e1 = np.cross(h, [1.0, 0, 0]);
    if np.linalg.norm(e1) < 0.1: e1 = np.cross(h, [0, 1.0, 0])
    e1 /= np.linalg.norm(e1); e2 = np.cross(h, e1)
    ang = np.sort(np.degrees(np.arctan2(o @ e2, o @ e1)))
    if len(ang) < 2: return 0.0
    gaps = np.diff(np.r_[ang, ang[0] + 360]); return float(360 - gaps.max())


def _hull(V):
    from scipy.spatial import ConvexHull
    try: return np.unique(np.round(ConvexHull(V).equations, 6), axis=0)
    except Exception:
        try: return ConvexHull(V, qhull_options='QJ').equations
        except Exception: return None


def _refine(V, F, sel, thr=0.10, iters=8, masks=()):
    """Subdivision conforme (sans fissure) des triangles qui touchent la zone : arêtes coupées en deux jusqu'à <= thr.
    Un fût de griffe maillé en longs triangles ne peut pas se cintrer ; une fois subdivisé, il se courbe proprement."""
    masks = list(masks)
    for _ in range(iters):
        if not len(F): break
        fsel = sel[F].any(1)
        E = np.sort(np.stack([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]], 1), axis=2)
        L = np.linalg.norm(V[E[..., 0]] - V[E[..., 1]], axis=2)
        lg = (L > thr) & fsel[:, None]
        if not lg.any(): break
        uk = np.unique(E[lg], axis=0); BIG = np.int64(len(V) + 1)
        ucode = uk[:, 0].astype(np.int64) * BIG + uk[:, 1]; code = E[..., 0].astype(np.int64) * BIG + E[..., 1]
        pos = np.clip(np.searchsorted(ucode, code), 0, len(uk) - 1); found = ucode[pos] == code
        nV = len(V); M = np.where(found, nV + pos, -1)
        V = np.vstack([V, (V[uk[:, 0]] + V[uk[:, 1]]) / 2]); sel = np.r_[sel, sel[uk[:, 0]] | sel[uk[:, 1]]]
        masks = [np.r_[m, m[uk[:, 0]] & m[uk[:, 1]]] for m in masks]
        sp = M >= 0; cnt = sp.sum(1); out = [F[cnt == 0]]
        for r in range(3):  # rotation : l'arête coupée (1 coupe) ou non coupée (2 coupes) mise à la position voulue
            Fr = np.roll(F, -r, 1); Mr = np.roll(M, -r, 1); a, b, c = Fr.T; m0, m1, m2 = Mr.T
            one = (cnt == 1) & (Mr[:, 0] >= 0)
            out += [np.c_[a, m0, c][one], np.c_[m0, b, c][one]]
            two = (cnt == 2) & (Mr[:, 2] < 0)
            out += [np.c_[m0, b, m1][two], np.c_[a, m0, m1][two], np.c_[a, m1, c][two]]
        a, b, c = F.T; m0, m1, m2 = M.T; th = cnt == 3
        out += [np.c_[a, m0, m2][th], np.c_[m0, b, m1][th], np.c_[m2, m1, c][th], np.c_[m0, m1, m2][th]]
        F = np.vstack(out).astype(int)
    return V, F, sel, masks


def _bend(X, base, D0, I, W, sig, oa, ob, L, theta, sigb, pw, ka, kb, theta0=0.0):
    """Griffe cintrée le long de son axe : courbure croissante vers le bout, section conservée (affinée par ka, kb).
    theta0 : griffe ouverte (penchée vers l'extérieur) redressée juste au-dessus du rondiste, comme la pince du sertisseur."""
    g = np.linspace(0, max(L, 1e-3), 241)
    r0 = np.clip(g / 0.3, 0, 1); r0 = r0 * r0 * (3 - 2 * r0)
    th = theta0 * r0 + theta * np.clip((g - sigb) / max(L - sigb, 1e-6), 0, 1) ** pw
    T = np.cos(th)[:, None] * D0 + np.sin(th)[:, None] * I
    C = np.vstack([np.zeros(3), np.cumsum((T[1:] + T[:-1]) / 2 * np.diff(g)[:, None], 0)])
    s = np.clip(sig, 0, L); Ci = np.stack([np.interp(s, g, C[:, k]) for k in range(3)], 1)
    ti = np.interp(s, g, th); Nb = np.cos(ti)[:, None] * I - np.sin(ti)[:, None] * D0
    ext = np.maximum(sig - L, 0)[:, None] * (np.cos(theta) * D0 + np.sin(theta) * I)  # (jamais atteint : sécurité)
    return base + Ci + ext + (oa * ka)[:, None] * Nb + (ob * kb)[:, None] * W


def _crown_z(xy_pts, c, h, Hh, zmax, zfloor=None):
    """Hauteur (selon h) de la surface de la pierre à la verticale de points : lancer de rayon vers le bas dans l'enveloppe."""
    up = Hh[:, :3] @ h > 1e-6; Hu = Hh[up]
    p0 = xy_pts + np.outer(zmax - (xy_pts - c) @ h, h)
    t = (p0 @ Hu[:, :3].T + Hu[:, 3]) / (Hu[:, :3] @ h); tm = t.max(1)
    pe = p0 - np.outer(tm, h); inside = (pe @ Hh[:, :3].T + Hh[:, 3]).max(1) < 1e-3  # le rayon touche vraiment la pierre
    return np.where(inside, zmax - tm, zfloor if zfloor is not None else -1e9)


def _talon(Y, f, Hh, s0, De, wpr=None):
    """Griffe d'aigle : bec effilé qui part du haut de la griffe rabattue et se couche sur la couronne,
    de plus en plus fin, jusqu'à une pointe arrondie (≈0,2 mm) posée sur la pierre, plus loin vers la table."""
    c, h = f['c'], f['h']
    hY = (Y - c) @ h; top = hY.max(); tm = hY > top - 0.30
    if tm.sum() < 5: return None
    Ct = Y[tm].mean(0); dp = (Ct - c) - ((Ct - c) @ h) * h; rc = np.linalg.norm(dp)
    if rc < 1e-6: return None
    I = -dp / rc; Wd = np.cross(h, I)
    wtop = wpr if wpr else min(np.ptp((Y[tm] - Ct) @ Wd), 0.125 * De + 0.1)
    Rg = float(f['Rfun'](dp[None])[0]); e = rc - Rg
    Lt = max(0.6, e + float(np.clip(0.12 * De, 0.7, 1.3)))
    b0, t0, rt = 0.47 * wtop, 0.40 * wtop, 0.10  # part de toute la largeur de la griffe : la griffe elle-même s'allonge
    M, N = 56, 28
    t = np.linspace(0, 1, M); x = Lt * t
    og = np.clip(1 - t ** 2, 0, 1) ** 0.75  # profil en ogive (côtés galbés, pas un cône) jusqu'à la pointe arrondie
    bw = rt + (b0 - rt) * og; bt = 0.075 + (t0 - 0.075) * og ** 1.1
    base = Ct - h * ((Ct - c) @ h)  # au niveau du centre, sans hauteur
    xy = base[None] + np.outer(x, I)
    zc = np.clip(_crown_z(xy, c, h, Hh, f['top'] + 2.0, f['girdle']), f['girdle'], f['top'])  # hors de la pierre : niveau du rondiste
    hs = top - t0 - 0.02  # centre de départ : le dessus du bec continue le dessus de la griffe
    rest = zc + bt + 0.02  # posé sur la couronne (hauteurs relatives au centre de la pierre)
    bl = np.clip(t / 0.40, 0, 1); bl = bl * bl * (3 - 2 * bl)
    zh = np.maximum((1 - bl) * hs + bl * rest, rest)
    Cl = xy + np.outer(zh - (xy - c) @ h, h)
    T = np.gradient(Cl, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True)
    Nr = np.cross(T, Wd); Nr /= np.linalg.norm(Nr, axis=1, keepdims=True)
    Nr *= np.sign((Nr @ h))[:, None] + (np.sign(Nr @ h) == 0)[:, None]
    ph = np.linspace(0, 2 * np.pi, N, endpoint=False)
    rings = [Cl[i] + np.outer(bw[i] * np.cos(ph), Wd) + np.outer(bt[i] * np.sin(ph), Nr[i]) for i in range(M)]
    for j in range(1, 7):  # bout arrondi
        a = j / 7 * np.pi / 2
        rings.append(Cl[-1] + T[-1] * rt * 1.1 * np.sin(a) + np.outer(bw[-1] * np.cos(a) * np.cos(ph), Wd) + np.outer(bt[-1] * np.cos(a) * np.sin(ph), Nr[-1]))
    V = np.vstack(rings + [Cl[-1] + T[-1] * rt * 1.1, Cl[0]]); R_ = len(rings); apex, st = R_ * N, R_ * N + 1
    F = []
    for i in range(R_ - 1):
        for j in range(N):
            a_, b_ = i * N + j, i * N + (j + 1) % N; c_, d_ = a_ + N, b_ + N
            F += [[a_, b_, d_], [a_, d_, c_]]
    F += [[(R_ - 1) * N + j, (R_ - 1) * N + (j + 1) % N, apex] for j in range(N)]
    F += [[st, (j + 1) % N, j] for j in range(N)]
    F = np.array(F)
    band = F[10 * 2 * N:11 * 2 * N]; n = np.cross(V[band[:, 1]] - V[band[:, 0]], V[band[:, 2]] - V[band[:, 0]])
    if np.mean(np.sum(n * (V[band].mean(1) - Cl[10]), 1)) < 0: F = F[:, ::-1]  # normales vers l'extérieur
    return {'V': V, 'F': F, 'N': None, 'layer': 'talon'}


def press_prongs(metal, f, style='rond', cyl=1.22, gemV=None, others=()):
    """Griffes serties comme le fait le sertisseur : coupées à la bonne longueur, limées (plus fines vers le bout) et
    cintrées sur la couronne le long de leur axe ; le bout arrondi dessiné dans le fichier est conservé.
    style 'aigle' : bout allongé qui avance plus loin sur la couronne et s'effile en pointe fine arrondie."""
    from scipy.spatial import cKDTree
    c, h = f['c'], f['h']; De = 2 * f['Rm']; crown = f['crown']
    aigle = style == 'aigle'
    C_t = float(np.clip(0.095 * De, 0.5, 1.0))  # avance du bout rond sur la couronne
    H_t = (0.42 * crown + 0.33) if aigle else (0.45 * crown + 0.35)  # hauteur du dessus au-dessus du rondiste
    w_t = float(np.clip(0.125 * De, 0.75, 1.25))                            # largeur finale de la griffe
    Hh = _hull(gemV) if gemV is not None else None
    reach = f['top'] + max(1.2, 0.9 * f['Rw']) + 1.5
    for part in metal:  # maillage des griffes affiné avant de les cintrer
        V = part['V']
        if not len(part['F']): continue
        d = V - c; p = d @ h; dp = d - np.outer(p, h); radial = np.linalg.norm(dp, axis=1)
        zone = (radial <= f['Rfun'](dp) * cyl + 2.2) & (p > f['girdle'] - 0.3) & (p <= reach + 1.5)
        if zone.sum() < 3: continue
        mk = [part['pressed']] if 'pressed' in part else []
        V2, F2, _, mk2 = _refine(V, part['F'], zone, 0.10, masks=mk)
        if len(V2) != len(V):
            part['V'], part['F'] = V2, F2; part['N'] = None
            if mk: part['pressed'] = mk2[0]
    refs, pos = [], []
    for pi, part in enumerate(metal):
        V = part['V']; d = V - c; p = d @ h; dp = d - np.outer(p, h)
        radial = np.linalg.norm(dp, axis=1); Rth = f['Rfun'](dp)
        done = part.get('pressed', np.zeros(len(V), bool))
        near = (radial <= Rth * (cyl + (0.13 if f['Rm'] > 2 else 0.0)) + 0.9) & (p <= reach) & (p > f['girdle']) & ~done
        wide = (radial <= Rth * cyl + 3.0) & (p <= reach + 1.5) & (p > f['girdle']) & ~done
        if wide.any(): refs.append((pi, np.where(wide)[0], near[wide])); pos.append(V[wide])
    if not refs: return 0
    P = np.vstack(pos); seed = np.concatenate([r[2] for r in refs])
    # la griffe entière, même si elle sort de la zone (griffe penchée vers l'extérieur) : croissance par voisinage
    inc = seed.copy()
    for _ in range(6):
        if inc.all(): break
        tr = cKDTree(P[inc]); dd, _ = tr.query(P[~inc], distance_upper_bound=0.3)
        add = np.where(~inc)[0][np.isfinite(dd)]
        if not len(add): break
        inc[add] = True
    idx_all = np.where(inc)[0]; Q = P[idx_all]; lab = _clusters(Q, 0.35)
    Pn = P.copy(); moved = np.zeros(len(P), bool); n_pr = 0; talons = []
    q_all = (Q - c) @ h - f['girdle']
    jobs = []
    w_max = max(1.9 * w_t, 1.6, 0.75 * f['Rw']); q_min = max(0.55, 0.3 * crown + 0.4) if f['R'] < 2.2 else 0.3
    def prong_like(g_, s0_=0.0):
        """Une vraie griffe : étroite (pas un morceau de serti clos ou de rail) et assez haute au-dessus du rondiste."""
        X_ = Q[g_]; q_ = q_all[g_] - s0_; o_ = (X_ - c) - np.outer((X_ - c) @ h, h)
        ctr_ = o_.mean(0); u_ = ctr_ / max(np.linalg.norm(ctr_), 1e-9); w_ = np.cross(h, u_)
        lo_ = q_ < q_.min() + min(0.35, 0.3 * (q_.max() - q_.min()) + 1e-3)
        wid = np.ptp(o_[lo_] @ w_) if lo_.sum() > 2 else np.ptp(o_ @ w_)
        # griffe d'une autre pierre (trois pierres, pierres d'épaule) : elle reste à cette pierre-là
        cm = X_.mean(0); dm_ = (cm - c) - ((cm - c) @ h) * h; gap = np.linalg.norm(dm_) - float(f['Rfun'](dm_[None])[0])
        for g2 in others:
            d2 = (cm - g2['c']) - ((cm - g2['c']) @ g2['h']) * g2['h']; gap2 = np.linalg.norm(d2) - float(g2['Rfun'](d2[None])[0])
            if gap2 < gap - 0.1: return False
        if _os.environ.get("BETO_PRONG_DEBUG"): print(f"    largeur {wid:.2f}/{w_max:.2f} haut {q_.max():.2f}/{q_min:.2f} écart {gap:.2f}")
        return wid <= w_max and q_.max() >= q_min and gap < 1.6
    for k in np.unique(lab):
        m = lab == k
        if m.sum() < 12 or q_all[m].max() < 0.3: continue
        o = (Q[m] - c) - np.outer((Q[m] - c) @ h, h)
        spn = _span_deg(o, h)
        if _os.environ.get("BETO_PRONG_DEBUG"): print(f"  groupe {m.sum()} pts, étendue {spn:.0f} deg, haut {q_all[m].max():.2f}, R {f['R']:.2f}")
        if spn <= 70:
            if prong_like(np.where(m)[0]): jobs.append((idx_all[m], 0.0))
            continue
        for ssp in (0.25, 0.5, 0.8, 1.2):  # serti clos, rail ou panier relié aux griffes : on ne garde que le haut des griffes
            mm = m & (q_all > ssp)
            if mm.sum() < 12: break
            sl = _clusters(Q[mm], 0.35); groups = [np.where(mm)[0][sl == j] for j in np.unique(sl)]
            groups = [g_ for g_ in groups if len(g_) >= 12 and q_all[g_].max() > ssp + 0.3]
            ok = 2 <= len(groups) <= 8 and all(_span_deg((Q[g_] - c) - np.outer((Q[g_] - c) @ h, h), h) <= 50 and prong_like(g_, ssp) for g_ in groups)
            if ok:
                jobs += [(idx_all[g_], ssp) for g_ in groups]; break
    for ids, s0 in jobs:
        X = P[ids]; d = X - c; s = d @ h - f['girdle'] - s0
        dp = d - np.outer(d @ h, h)
        s = s - max(0.0, s.min()) * 0; bm = s < s.min() + min(0.3, 0.3 * (s.max() - s.min()))
        Bp = dp[bm].mean(0); u = -Bp / max(np.linalg.norm(Bp), 1e-9)
        # axe de la griffe : droite ajustée sur les centres des tranches (griffe penchée ou droite)
        nb = 8; edges = np.linspace(0, s.max() * 0.7 + 1e-6, nb + 1); cs, ss = [], []
        for i0 in range(nb):
            sm = (s >= edges[i0]) & (s < edges[i0 + 1])
            if sm.sum() >= 3: cs.append(X[sm].mean(0)); ss.append(s[sm].mean())
        if len(cs) >= 2:
            A = np.c_[np.ones(len(ss)), ss]; coef, *_ = np.linalg.lstsq(A, np.array(cs), rcond=None)
            base0 = coef[0]; D0 = coef[1] / max(np.linalg.norm(coef[1]), 1e-9)
            if D0 @ h < 0.5: D0 = h.copy()
        else: base0 = X[bm].mean(0); D0 = h.copy()
        base0 = base0 + D0 * (0 - ((base0 - c) @ h - f['girdle'] - s0)) / max(D0 @ h, 1e-3)  # origine au niveau du rondiste
        I = u - (u @ D0) * D0; I /= max(np.linalg.norm(I), 1e-9); W = np.cross(D0, I)
        th0 = float(max(0.0, np.arcsin(np.clip(-(D0 @ u), -1, 1))))  # penchée vers l'extérieur : redressée à la verticale
        r = X - base0; sig = r @ D0; oa = r @ I; ob = r @ W
        smax = sig.max(); tipH = min(0.5, 0.45 * smax); Lb = min(0.35, 0.3 * smax); sc_ = smax - tipH
        wb = np.ptp(ob[sig < min(0.35, 0.3 * smax)]) if (sig < min(0.35, 0.3 * smax)).sum() > 3 else w_t
        k_end = float(np.clip(w_t / max(wb, 1e-3), 0.72, 1.0)) if wb < 1.6 * w_t else 0.9
        g_tip = k_end
        def remap(L):
            sf = (L - g_tip * (Lb / 2 + tipH)) / max(smax - Lb / 2 - tipH, 1e-6); sf = max(sf, 0.05)
            x = np.clip((sig - (sc_ - Lb)) / max(Lb, 1e-6), 0, 1)
            sp = sf * sig + (g_tip - sf) * (Lb * (x ** 3 - x ** 4 / 2) + np.maximum(sig - sc_, 0))
            return np.where(sig < 0, sig, sp), sf * (smax - Lb / 2 - tipH) + g_tip * (Lb / 2 + tipH)
        def shape(L, theta, hinge=0.0):
            sp, Ln = remap(L); t = np.clip(sp / 0.35, 0, 1)  # limée sur toute la partie visible (même finesse jusqu'au bout)
            S = t * t * (3 - 2 * t); ka = 1 - (1 - k_end) * S; kb = ka
            Y = _bend(X, base0, D0, I, W, sp, oa, ob, Ln, theta, min(0.15, 0.2 * Ln), 1.3, ka, kb, th0 + hinge)
            pen = 0.0
            if Hh is not None:  # face intérieure appuyée sur la couronne (siège du sertisseur) : le métal suit les facettes
                dd = Y @ Hh[:, :3].T + Hh[:, 3]; k = np.argmax(dd, 1); mx = dd[np.arange(len(Y)), k]
                ins = (mx < -0.015) & (((Y - c) @ h) > f['girdle'] - 0.05)
                if ins.any():
                    pen = float(-mx[ins].min()); Y[ins] += Hh[k[ins], :3] * (-mx[ins] + 0.015)[:, None]
                dY = Y - c; dpY = dY - np.outer(dY @ h, h); over = (f['Rfun'](dpY) - np.linalg.norm(dpY, axis=1)) > 0.05
                gap = over & (mx > 0.015) & (mx < 0.11) & ((dY @ h) > f['girdle'] + 0.1)
                if gap.any(): Y[gap] -= Hh[k[gap], :3] * (mx[gap] - 0.015)[:, None]  # le bout touche la couronne : pas de jour dessous
            return Y, pen
        def score(Yp):
            Y, pen = Yp; dY = Y - c; hY = dY @ h - f['girdle'] - s0; dpY = dY - np.outer(dY @ h, h)
            inside = f['Rfun'](dpY) - np.linalg.norm(dpY, axis=1); top = hY.max()
            above = (Y @ Hh[:, :3].T + Hh[:, 3]).max(1) if Hh is not None else np.full(len(Y), 1.0)  # hauteur au-dessus de la pierre
            real = (hY > 0.15) & (above > 0.12)  # vrai métal posé sur la couronne (pas la peau du siège)
            cov = inside[real].max() if real.any() else -1.0
            over = inside > 0.25; thick = above[over].max() if over.any() else 0.0
            return (top - H_t) ** 2 + 0.7 * (cov - C_t) ** 2 + 4 * max(0.0, 0.40 - thick) ** 2, top, cov, thick
        best = None
        # recherche : pliage au siège (charnière au rondiste) + courbure du bout + longueur coupée
        def ev(L, th, hg):
            sc = score(shape(L, th, hg)); return (sc[0] + 0.01 * ((np.degrees(th + hg) - 12) / 10) ** 2,) + sc[1:]
        for hg in np.radians([0, 8, 16, 24, 32]):
            for th in np.radians(np.linspace(0, 45, 8)):
                for L in np.linspace(0.6 * H_t, 2.0 * H_t, 8):
                    sc = ev(L, th, hg)
                    if best is None or sc[0] < best[0][0]: best = (sc, L, th, hg)
        (sc, L, th, hg) = best
        if _os.environ.get('BETO_PRONG_FORCE'):  # diagnostic : angle (degrés), longueur, charnière (degrés) imposés
            fo = [float(v) for v in _os.environ['BETO_PRONG_FORCE'].split(',')]
            th, L = np.radians(fo[0]), fo[1]; hg = np.radians(fo[2]) if len(fo) > 2 else 0.0; sc = ev(L, th, hg)
        for _ in range(0 if _os.environ.get('BETO_PRONG_FORCE') else 3):  # affinage local
            for dth, dL, dh in [(a_, 0, 0) for a_ in np.radians([-3, 3])] + [(0, b_, 0) for b_ in (-0.05, 0.05)] + [(0, 0, c_) for c_ in np.radians([-3, 3])]:
                s2 = ev(L + dL, th + dth, max(0.0, hg + dh))
                if s2[0] < sc[0]: sc, L, th, hg = s2, L + dL, th + dth, max(0.0, hg + dh)
        if _os.environ.get("BETO_PRONG_DEBUG"): print(f"griffe {style}: angle {np.degrees(th):.0f} L {L:.2f} haut {sc[1]:.2f}/{H_t:.2f} avance {sc[2]:.2f}/{C_t:.2f} épaisseur sur la pierre {sc[3]:.2f} k {k_end:.2f} redressée {np.degrees(th0):.0f} charnière {np.degrees(hg):.0f}")
        Pn[ids] = shape(L, th, hg)[0]; moved[ids] = True; n_pr += 1
        if aigle and wb < 1.6 * w_t and Hh is not None:
            tal = _talon(Pn[ids], f, Hh, s0, De, k_end * wb)
            if tal is not None: talons.append(tal)
    o = 0
    for pi, idx, _ in refs:
        n = len(idx); mv = moved[o:o + n]
        if mv.any():
            metal[pi]['V'][idx[mv]] = Pn[o:o + n][mv]
            pm = metal[pi].get('pressed', np.zeros(len(metal[pi]['V']), bool)); pm[idx[mv]] = True; metal[pi]['pressed'] = pm
            metal[pi]['N'] = None; metal[pi]['resharp'] = True
        o += n
    # pli au siège lissé (une griffe redressée puis rabattue ne doit pas faire de bosse au rondiste)
    if n_pr:
        for part in metal:
            pm = part.get('pressed')
            if pm is None or not pm.any() or not len(part['F']): continue
            V = part['V']; d = V - c; p = d @ h; dp = d - np.outer(p, h); rad = np.linalg.norm(dp, axis=1)
            band = (np.abs(p - f['girdle']) < 0.45) & (rad <= f['Rfun'](dp) * cyl + 2.2)
            if not band.any(): continue
            from scipy.spatial import cKDTree
            tr = cKDTree(V[pm]); dd, _ = tr.query(V[band], distance_upper_bound=0.6)
            sel = np.zeros(len(V), bool); sel[np.where(band)[0][np.isfinite(dd)]] = True
            if not sel.any(): continue
            E = np.r_[part['F'][:, [0, 1]], part['F'][:, [1, 2]], part['F'][:, [2, 0]]]
            for _ in range(6):
                acc = np.zeros_like(V); cnt = np.zeros(len(V))
                np.add.at(acc, E[:, 0], V[E[:, 1]]); np.add.at(cnt, E[:, 0], 1)
                np.add.at(acc, E[:, 1], V[E[:, 0]]); np.add.at(cnt, E[:, 1], 1)
                avg = acc / np.maximum(cnt, 1)[:, None]; w = np.clip(1 - np.abs(p - f['girdle']) / 0.45, 0, 1)[:, None] * 0.5
                V[sel] = V[sel] + w[sel] * (avg[sel] - V[sel])
            part['N'] = None; part['resharp'] = True
    metal += talons
    return n_pr


def finish(metal, gems, tip=0.38, cyl=1.22, min_gem=0.6, bend=0.42, prong_style=None):
    """Modifie les maillages métal sur place ; renvoie la liste des bouts arrondis (centre, rayon).
    prong_style 'rond' / 'aigle' : griffes des grandes pierres rabattues (forme du fichier gardée), sans coupe ni boule."""
    caps = []
    from scipy.spatial import ConvexHull
    big_gems = sorted([gm for gm in gems if np.ptp(gm['V'], 0).max() >= min_gem], key=lambda g: -np.ptp(g['V'], 0).max())  # grande pierre d'abord
    frames = [gem_frame(gm['V']) for gm in big_gems]
    for f, gm in zip(frames, big_gems):
        c, h, R = f['c'], f['h'], f['R']
        zc = f['girdle'] + tip * f['crown']
        moved = []
        if prong_style and R >= 1.5:
            press_prongs(metal, f, prong_style, cyl, gm['V'], [g for g in frames if g is not f and g['R'] >= 1.0])
        for part in (metal if not (prong_style and R >= 1.5) else []):
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
            if R < 1.5: rad = min(max(1.0 * rad, 0.08), 0.40 * R)  # grain du pavé : pas plus large que la tige
            else: rad = min(max(rad, 0.06), 0.16 * f['Rm'] + 0.15)
            caps.append((ctr - h * 0.45 * rad, rad))
    return caps
