"""Taille brillant exacte (57 facettes + rondiste) par intersection de demi-espaces.
Proportions « excellent » : table 56 %, couronne 34,5°, pavillon 40,8°, étoiles 50 %, haléfis inférieurs 77 %."""
import math, numpy as np
from scipy.spatial import HalfspaceIntersection, ConvexHull

def _plane(az_deg, tilt_deg, point, up=True):
    a, t = math.radians(az_deg), math.radians(tilt_deg)
    n = np.array([math.cos(a) * math.sin(t), math.sin(a) * math.sin(t), (math.cos(t) if up else -math.cos(t))])
    return np.append(n, -n @ np.asarray(point))  # n·x + d <= 0

def brilliant(table=0.56, crown=34.5, pavilion=40.8, girdle=0.03, star=21.8, upper=42.0, lower=42.2, girdle_n=96):
    g = girdle / 2
    zt = g + (1 - table) * math.tan(math.radians(crown))
    H = [np.array([0, 0, 1, -zt])]  # table
    for k in range(8):
        az = 45 * k
        H.append(_plane(az, crown, (math.cos(math.radians(az)), math.sin(math.radians(az)), g)))
        H.append(_plane(az, pavilion, (math.cos(math.radians(az)), math.sin(math.radians(az)), -g), up=False))
        m = az + 22.5; rm = table * math.cos(math.radians(22.5))
        H.append(_plane(m, star, (rm * math.cos(math.radians(m)), rm * math.sin(math.radians(m)), zt)))
        for off in (11.25, 33.75):
            b = math.radians(az + off)
            H.append(_plane(az + off, upper, (math.cos(b), math.sin(b), g)))
            H.append(_plane(az + off, lower, (math.cos(b), math.sin(b), -g), up=False))
    for j in range(girdle_n):
        a = 2 * math.pi * j / girdle_n
        H.append(np.array([math.cos(a), math.sin(a), 0, -1.0]))
    hs = HalfspaceIntersection(np.array(H), np.array([0, 0, 0.0]))
    V = hs.intersections
    hull = ConvexHull(V)
    # regrouper les triangles par facette plane (normales égales) pour un rendu à facettes nettes
    return V, hull.simplices, zt

def oriented(V, F):
    """Oriente les triangles vers l'extérieur."""
    c = V.mean(0); out = []
    for f in F:
        a, b, d = V[f]
        n = np.cross(b - a, d - a)
        out.append(f if n @ (a - c) > 0 else f[::-1])
    return np.array(out)

if __name__ == '__main__':
    V, F, zt = brilliant(); F = oriented(V, F)
    from collections import Counter
    N = []
    for f in F:
        a, b, d = V[f]; n = np.cross(b - a, d - a); N.append(tuple(np.round(n / np.linalg.norm(n), 4)))
    print('sommets', len(V), 'triangles', len(F), 'facettes planes', len(set(N)), 'z table', round(zt, 3), 'profondeur', round(V[:, 2].max() - V[:, 2].min(), 3))
