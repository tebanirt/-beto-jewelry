"""Générateur de tailles de diamant (facettes planes exactes, intersection de demi-espaces).
Formes : rond, ovale, coussin, poire, marquise, princesse, radiant (taille brillant sur contour), émeraude (taille à degrés).
Repère : z vers le haut (table), contour dans le plan xy, demi-longueur = 1 sur l'axe y."""
import math, json, numpy as np
from scipy.spatial import HalfspaceIntersection, ConvexHull

# ---------- contours convexes ----------
def _poly_from_fn(fn, n=720):
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    return np.array([fn(a) for a in t])

def outline(shape):
    if shape == 'rond':
        return _poly_from_fn(lambda a: (math.cos(a), math.sin(a)))
    if shape == 'ovale':
        return _poly_from_fn(lambda a: (0.74 * math.cos(a), math.sin(a)))
    if shape == 'coussin':
        n = 3.4
        f = lambda a: (0.92 * np.sign(math.cos(a)) * abs(math.cos(a)) ** (2 / n), np.sign(math.sin(a)) * abs(math.sin(a)) ** (2 / n))
        return _poly_from_fn(f)
    if shape == 'marquise':
        w = 0.5; R = (1 + w * w) / (2 * w); c = R - w   # deux arcs de cercle passant par (0,±1) et (±w,0)
        pts = []
        for a in np.linspace(-math.asin(1 / R), math.asin(1 / R), 360):
            pts.append((R * math.cos(a) - c, R * math.sin(a)))
        for a in np.linspace(-math.asin(1 / R), math.asin(1 / R), 360):
            pts.append((-(R * math.cos(a) - c), -R * math.sin(a)))
        return np.array(pts)
    if shape == 'poire':
        r = 0.62; cy = -1 + r
        P = [(r * math.cos(a), cy + r * math.sin(a)) for a in np.linspace(0, 2 * np.pi, 360, endpoint=False)]
        w = 0.62; R = 2.4  # flancs légèrement bombés jusqu'à la pointe (0,1)
        for s in (1, -1):
            for t in np.linspace(0, 1, 200):
                y = cy + t * (1 - cy); x = s * (w * (1 - t) ** 0.85 * (1 + 0.18 * math.sin(math.pi * t)))
                P.append((x, y))
        P = np.array(P); h = ConvexHull(P); return P[h.vertices]
    if shape in ('princesse', 'radiant', 'emeraude'):
        hw, hl, cut = {'princesse': (1.0, 1.0, 0.04), 'radiant': (0.8, 1.0, 0.16), 'emeraude': (0.72, 1.0, 0.17)}[shape]
        return np.array([(hw - cut, hl), (-(hw - cut), hl), (-hw, hl - cut), (-hw, -(hl - cut)), (-(hw - cut), -hl), (hw - cut, -hl), (hw, -(hl - cut)), (hw, hl - cut)])
    raise ValueError(shape)

def _ray_hit(P, theta):
    """Point du contour dans la direction theta et normale extérieure."""
    d = np.array([math.cos(theta), math.sin(theta)])
    h = ConvexHull(P); E = h.equations  # a x + b y + c <= 0
    best = None
    for (a, b, c) in E:
        den = a * d[0] + b * d[1]
        if den > 1e-12:
            t = -c / den
            if best is None or t < best[0]: best = (t, np.array([a, b]))
    t, n = best
    return d * t, n / np.linalg.norm(n)

def _girdle_planes(P, n=160):
    if len(P) > n:
        P = P[np.linspace(0, len(P) - 1, n).astype(int)]
    h = ConvexHull(P); H = []
    for (a, b, c) in h.equations:
        H.append([a, b, 0.0, c])
    return H

def _tilted(nxy, tilt, point, up=True):
    t = math.radians(tilt)
    nn = np.array([nxy[0] * math.sin(t), nxy[1] * math.sin(t), math.cos(t) if up else -math.cos(t)])
    return list(nn) + [-(nn @ np.asarray(point))]

def brilliant_on(P, table=0.56, crown=34.0, pavilion=40.8, girdle=0.03, star=22.0, upper=42.0, lower=42.5, ref_w=None, facet_outline=None, chevrons=False):
    g = girdle / 2
    Pf = facet_outline if facet_outline is not None else P
    w = ref_w or np.ptp(P[:, 0]) / 2
    zt = g + (1 - table) * w * math.tan(math.radians(crown))
    H = [[0, 0, 1, -zt]] + _girdle_planes(P)
    for k in range(8):
        th = math.radians(90 + 45 * k)  # une principale sur chaque pointe (axe long)
        p, n = _ray_hit(Pf, th)
        H.append(_tilted(n, crown, (p[0], p[1], g)))
        H.append(_tilted(n, pavilion, (p[0], p[1], -g), up=False))
        thm = th + math.radians(22.5)
        pm, nm = _ray_hit(Pf, thm)
        q = pm * (table + (1 - table) * 0.02)
        q = q * math.cos(math.radians(22.5)) * (1 / max(0.6, math.cos(math.radians(22.5))))
        H.append(_tilted(nm, star, (q[0] * table / max(table, 1e-9), q[1], zt)))
        for off in (11.25, 33.75):
            pu, nu = _ray_hit(Pf, th + math.radians(off))
            H.append(_tilted(nu, upper, (pu[0], pu[1], g)))
            H.append(_tilted(nu, lower, (pu[0], pu[1], -g), up=False))
        if chevrons:  # facettes en chevron du pavillon (princesse / radiant)
            for off, tl in ((15, 38.5), (30, 43.5), (-15, 38.5)):
                pc, nc = _ray_hit(Pf, th + math.radians(off))
                H.append(_tilted(nc, tl, (pc[0], pc[1], -g), up=False))
    return np.array(H)

def step_cut(P, table=0.62, girdle=0.025, crown_tilts=(48, 36, 24), pav_tilts=(62, 50, 40), crown_h=0.12, pav_d=0.66):
    g = girdle / 2
    h = ConvexHull(P); E = h.equations
    H = _girdle_planes(P)
    # profil de couronne : retraits successifs vers la table
    zs = g; inset = 0.0
    w = np.ptp(P[:, 0]) / 2
    step = (1 - table) * w / len(crown_tilts)
    zc = g
    for t in crown_tilts:
        for (a, b, c) in E:
            n = np.array([a, b]); p0 = -c * n  # point du bord
            pt = p0 - n * inset
            H.append(_tilted(n, t, (pt[0], pt[1], zc)))
        zc += step * math.tan(math.radians(t)); inset += step
    H.append([0, 0, 1, -min(zc, g + crown_h * 2)])
    inset = 0.0; zp = -g
    pstep = w / len(pav_tilts)
    for t in pav_tilts:
        for (a, b, c) in E:
            n = np.array([a, b]); p0 = -c * n
            pt = p0 - n * inset
            H.append(_tilted(n, t, (pt[0], pt[1], zp), up=False))
        zp -= pstep * 0.55 * math.tan(math.radians(t)); inset += pstep * 0.55
    return np.array(H)

def solid(H):
    hs = HalfspaceIntersection(np.asarray(H, float), np.array([0, 0, 0.0]))
    V = hs.intersections
    hull = ConvexHull(V)
    F = []
    c = V.mean(0)
    for f in hull.simplices:
        a, b, d = V[f]
        F.append(list(f) if np.cross(b - a, d - a) @ (a - c) > 0 else list(f[::-1]))
    return V, np.array(F)

def gem(shape):
    P = outline(shape)
    if shape in ('princesse', 'radiant'):
        hw = np.ptp(P[:, 0]) / 2; hl = np.ptp(P[:, 1]) / 2; n = 7.0
        se = _poly_from_fn(lambda a: (hw * np.sign(math.cos(a)) * abs(math.cos(a)) ** (2 / n), hl * np.sign(math.sin(a)) * abs(math.sin(a)) ** (2 / n)))
        H = brilliant_on(P, facet_outline=se, chevrons=True, table=0.62 if shape == 'princesse' else 0.6, crown=33 if shape == 'princesse' else 34)
    else:
        H = step_cut(P) if shape == 'emeraude' else brilliant_on(P)
    V, F = solid(H)
    return V, F

def facet_count(V, F):
    N = set()
    for f in F:
        a, b, d = V[f]; n = np.cross(b - a, d - a); n /= np.linalg.norm(n); N.add(tuple(np.round(n, 3)))
    return len(N)

SHAPES = ['rond', 'ovale', 'coussin', 'emeraude', 'poire', 'marquise', 'radiant', 'princesse']
if __name__ == '__main__':
    import sys
    out = {}
    for s in SHAPES:
        V, F = gem(s)
        out[s] = {'v': np.round(V, 5).ravel().tolist(), 'f': F.ravel().tolist()}
        print(s, 'sommets', len(V), 'triangles', len(F), 'facettes', facet_count(V, F), 'L×l×h', np.round(np.ptp(V, 0), 3).tolist())
    if len(sys.argv) > 1: json.dump(out, open(sys.argv[1], 'w'))
