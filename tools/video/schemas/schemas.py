"""schemas — Beto Jewelry diagram bank (4K line drawings for explainer reels and carousels).

Generic, industry-standard shapes and ring styles drawn as clean vector line art: stone shapes seen
from the top (facet pattern), the anatomy of a round brilliant, round diamonds to scale by carat,
and ring styles in profile (solitaire, cathedral, hidden halo, semi / three-quarter / full eternity).
They are drawings, never presented as photos of a real piece (docs/design-brief.md §6).

Every drawing lives in a 1000 x 1000 viewBox. Every stroke is a <path pathLength="1"> so the motion
layer can draw it on (stroke-dashoffset 1 -> 0). The output has no text: labels are added in the
reel (FR or EN), so one drawing serves both languages.

    python3 schemas.py OUT_DIR            # writes OUT_DIR/<colorway>/<name>.svg
"""
import math
import os
import sys

COLORWAYS = {  # line colour, fill colour (very light tint so the stone reads over video)
    "or": ("#C9A86A", "#C9A86A"),
    "ivoire": ("#F6F3EE", "#F6F3EE"),
    "encre": ("#0F0E0C", "#0F0E0C"),
}
W_OUT, W_FAC, W_FINE = 2.6, 1.25, 0.9      # stroke widths (viewBox units): outline, facets, fine details
FILL_OP = 0.06
C = (500.0, 500.0)
TAU = 2 * math.pi


# ---------------------------------------------------------------- geometry helpers
def P(x, y):
    return f"{x:.2f},{y:.2f}"


def poly_d(pts, closed=True):
    return "M" + " L".join(P(*p) for p in pts) + (" Z" if closed else "")


def seg_d(a, b):
    return f"M{P(*a)} L{P(*b)}"


def circle_d(cx, cy, r):
    return (f"M{P(cx + r, cy)} A{r:.2f},{r:.2f} 0 1 1 {P(cx - r, cy)} "
            f"A{r:.2f},{r:.2f} 0 1 1 {P(cx + r, cy)} Z")


def arc_d(cx, cy, r, a0, a1):
    """Arc from angle a0 to a1 (radians, SVG coordinates: y down), drawn the short way when |a1-a0| < pi."""
    x0, y0 = cx + r * math.cos(a0), cy + r * math.sin(a0)
    x1, y1 = cx + r * math.cos(a1), cy + r * math.sin(a1)
    large = 1 if abs(a1 - a0) > math.pi else 0
    sweep = 1 if a1 > a0 else 0
    return f"M{P(x0, y0)} A{r:.2f},{r:.2f} 0 {large} {sweep} {P(x1, y1)}"


def ray_hit(outline, theta, c=C):
    """Farthest intersection of the ray from c at angle theta with a closed polygon (star-shaped)."""
    dx, dy = math.cos(theta), math.sin(theta)
    best = None
    n = len(outline)
    for i in range(n):
        (x1, y1), (x2, y2) = outline[i], outline[(i + 1) % n]
        ex, ey = x2 - x1, y2 - y1
        den = dx * ey - dy * ex
        if abs(den) < 1e-12:
            continue
        t = ((x1 - c[0]) * ey - (y1 - c[1]) * ex) / den
        u = ((x1 - c[0]) * dy - (y1 - c[1]) * dx) / den
        if t > 0 and -1e-9 <= u <= 1 + 1e-9 and (best is None or t > best):
            best = t
    return best


def at(outline, theta, f, c=C):
    r = ray_hit(outline, theta, c)
    return (c[0] + f * r * math.cos(theta), c[1] + f * r * math.sin(theta))


class Drawing:
    def __init__(self):
        self.layers = []        # (group_id, [paths]) — drawn in order, ids name the draw-on steps
        self.defs = []
        self.masks = {}

    def add(self, group, d, w=W_FAC, fill=False):
        self.layers.append((group, d, w, fill))

    def svg(self, line, fill):
        out = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">']
        if self.masks:
            out.append("<defs>")
            for mid, holes in self.masks.items():
                out.append(f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
                           '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/>')
                for h in holes:
                    out.append(f'<path d="{h}" fill="#000"/>')
                out.append("</mask>")
            out.append("</defs>")
        groups = []
        for g, d, w, f in self.layers:
            if not groups or groups[-1][0] != g:
                groups.append((g, []))
            groups[-1][1].append((d, w, f))
        for g, items in groups:
            name, _, mask = g.partition("@")
            m = f' mask="url(#{mask})"' if mask else ""
            out.append(f'<g id="{name}" data-step="{name}"{m} fill="none" stroke="{line}" '
                       'stroke-linecap="round" stroke-linejoin="round">')
            for d, w, f in items:
                fa = f' fill="{fill}" fill-opacity="{FILL_OP}"' if f else ""
                out.append(f'<path d="{d}" stroke-width="{w}" pathLength="1"{fa}/>')
            out.append("</g>")
        out.append("</svg>")
        return "\n".join(out)


# ---------------------------------------------------------------- stone outlines (top view)
def outline_round(R=380):
    return [(C[0] + R * math.cos(t), C[1] + R * math.sin(t)) for t in (TAU * i / 720 for i in range(720))]


def outline_ellipse(a, b):
    return [(C[0] + a * math.cos(t), C[1] + b * math.sin(t)) for t in (TAU * i / 720 for i in range(720))]


def outline_superellipse(a, b, n):
    pts = []
    for i in range(720):
        t = TAU * i / 720
        ct, st = math.cos(t), math.sin(t)
        pts.append((C[0] + a * math.copysign(abs(ct) ** (2 / n), ct), C[1] + b * math.copysign(abs(st) ** (2 / n), st)))
    return pts


def outline_marquise(L=420, ratio=2.0):
    """Vesica (two circular arcs) with points at top and bottom; length 2L, width 2L/ratio."""
    w = L / ratio
    R = (L * L + w * w) / (2 * w)           # circle through the two tips and the widest point
    pts = []
    for side in (1, -1):                    # right arc then left arc
        cx = C[0] - side * (R - w)
        a = math.asin(L / R)
        rng = [(-a + 2 * a * i / 360) for i in range(361)]
        for t in (rng if side == 1 else rng[::-1]):
            pts.append((cx + side * R * math.cos(t), C[1] + R * math.sin(t)))
    return pts


def outline_pear(H=400, ratio=1.6):
    """Teardrop x = sin t * sin(t/2), y = -cos t (point at the top), scaled to the ratio."""
    raw = [(math.sin(t) * math.sin(t / 2), -math.cos(t)) for t in (TAU * i / 720 for i in range(720))]
    wmax = max(abs(x) for x, _ in raw)
    sx = H / ratio / wmax
    cy = C[1] + 30                          # visual centre: the round end carries the weight
    return [(C[0] + x * sx, cy + y * H) for x, y in raw]


def outline_heart(S=390):
    raw = []
    for i in range(720):
        t = TAU * i / 720
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        raw.append((x, y))
    xs, ys = [p[0] for p in raw], [p[1] for p in raw]
    s = 2 * S / max(max(xs) - min(xs), max(ys) - min(ys))
    mx, my = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
    return [(C[0] + (x - mx) * s, C[1] + (y - my) * s * 0.96) for x, y in raw]


def outline_cut_rect(a, b, c):
    """Rectangle (half-dims a, b) with 45-degree corner cuts of size c (emerald, asscher, radiant)."""
    x0, y0 = C
    return [(x0 - a + c, y0 - b), (x0 + a - c, y0 - b), (x0 + a, y0 - b + c), (x0 + a, y0 + b - c),
            (x0 + a - c, y0 + b), (x0 - a + c, y0 + b), (x0 - a, y0 + b - c), (x0 - a, y0 - b + c)]


# ---------------------------------------------------------------- facet patterns
def brilliant(dr, outline, c=C, table=0.56, star=0.78, rot=0.0, step="facettes"):
    """Round-brilliant crown pattern mapped onto any star-shaped outline (polar mapping).

    Table octagon (vertices at 22.5 + 45k deg, flats at `table` of the girdle radius), 8 star facets
    (tips at 45k deg), 8 kites (bezels) and 16 upper-girdle facets."""
    tv = table / math.cos(math.pi / 8)      # vertex radius of an octagon whose flats sit at `table`
    A = [rot + math.pi / 8 + k * math.pi / 4 for k in range(8)]        # table vertex angles
    S = [rot + k * math.pi / 4 for k in range(8)]                      # star tip angles
    T = [at(outline, a, tv, c) for a in A]
    ST = [at(outline, s, star, c) for s in S]
    G_A = [at(outline, a, 1.0, c) for a in A]
    G_S = [at(outline, s, 1.0, c) for s in S]
    dr.add(step + "-table", poly_d(T), W_FAC)
    for k in range(8):                       # star facets: table vertex -> star tips on each side
        dr.add(step + "-etoiles", seg_d(T[k], ST[k]), W_FAC)
        dr.add(step + "-etoiles", seg_d(T[k], ST[(k + 1) % 8]), W_FAC)
    for k in range(8):                       # kites: star tips -> girdle at the table-vertex angles
        dr.add(step + "-bezels", seg_d(ST[k], G_A[k]), W_FINE)
        dr.add(step + "-bezels", seg_d(ST[k], G_A[(k - 1) % 8]), W_FINE)
    for k in range(8):                       # upper girdle facets: star tip -> girdle, radial
        dr.add(step + "-rondiste", seg_d(ST[k], G_S[k]), W_FINE)


def step_cut(dr, a, b, c, steps=(0.0, 0.16, 0.31), table_inset=0.45, step="facettes"):
    """Emerald / asscher step cut: concentric inset octagons + corner lines to the table."""
    m = min(a, b)
    insets = [s * m for s in steps] + [table_inset * m]
    rings = []
    for d in insets:
        ca = c - d * (2 - math.sqrt(2))
        rings.append(outline_cut_rect(a - d, b - d, max(ca, 2.0)))
    for i, ring in enumerate(rings[1:], 1):
        dr.add(step + ("-table" if i == len(rings) - 1 else "-gradins"), poly_d(ring), W_FAC if i == len(rings) - 1 else W_FINE)
    outer, inner = rings[0], rings[-1]
    for k in range(8):
        dr.add(step + "-coins", seg_d(outer[k], inner[k]), W_FINE)


def stone_top(name):
    dr = Drawing()
    if name == "rond":
        o = outline_round(380)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o)
    elif name == "ovale":
        o = outline_ellipse(285, 400)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o)
    elif name == "coussin":
        o = outline_superellipse(360, 380, 2.9)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o, table=0.52, star=0.76)
    elif name == "princesse":
        o = outline_cut_rect(350, 350, 6)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o, table=0.55, star=0.8)
    elif name == "emeraude":
        a, b, c = 265, 380, 70
        o = outline_cut_rect(a, b, c)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        step_cut(dr, a, b, c)
    elif name == "asscher":
        a = b = 345
        c = 100
        o = outline_cut_rect(a, b, c)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        step_cut(dr, a, b, c, steps=(0.0, 0.14, 0.27), table_inset=0.40)
        inner = outline_cut_rect(a * 0.6, b * 0.6, c * 0.45)
        for k in (0, 2, 4, 6):              # the asscher "windmill" seen through the table
            dr.add("facettes-moulin", seg_d(inner[k], C), W_FINE)
    elif name == "radiant":
        a, b, c = 285, 375, 55
        o = outline_cut_rect(a, b, c)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o, table=0.55, star=0.8)
        step_ring = outline_cut_rect(a - 22, b - 22, c - 22 * (2 - math.sqrt(2)))
        dr.add("facettes-rondiste", poly_d(step_ring), W_FINE)
    elif name == "poire":
        o = outline_pear(410, 1.6)
        c = (C[0], C[1] + 75)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o, c=c, table=0.52, star=0.77)
    elif name == "marquise":
        o = outline_marquise(430, 2.05)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o, table=0.5, star=0.76)
    elif name == "coeur":
        o = outline_heart(385)
        c = (C[0], C[1] + 25)
        dr.add("contour", poly_d(o), W_OUT, fill=True)
        brilliant(dr, o, c=c, table=0.5, star=0.76)
    else:
        raise KeyError(name)
    return dr


SHAPES = ["rond", "ovale", "coussin", "princesse", "emeraude", "asscher", "radiant", "poire", "marquise", "coeur"]


# ---------------------------------------------------------------- round brilliant in profile
def brilliant_profile(dr, cx, yg, w, step="pierre", mask=None, girdle=None):
    """Side view of a round brilliant: girdle centre (cx, yg), diameter w.
    Proportions of a well-cut round: table 56 %, crown 15 %, pavilion 43 %, thin girdle."""
    g = girdle if girdle is not None else max(w * 0.018, 1.2)
    ht, hc, hp = w * 0.28, w * 0.15, w * 0.43
    yt, yb, yc = yg - g / 2 - hc, yg + g / 2, yg + g / 2 + hp
    m = f"@{mask}" if mask else ""
    outline = [(cx - ht, yt), (cx + ht, yt), (cx + w / 2, yg - g / 2), (cx + w / 2, yb), (cx, yc),
               (cx - w / 2, yb), (cx - w / 2, yg - g / 2)]
    dr.add(step + "-contour" + m, poly_d(outline), W_OUT if w > 120 else W_FAC, fill=True)
    dr.add(step + "-rondiste" + m, seg_d((cx - w / 2, yg - g / 2), (cx + w / 2, yg - g / 2)), W_FINE)
    dr.add(step + "-rondiste" + m, seg_d((cx - w / 2, yb), (cx + w / 2, yb)), W_FINE)
    # crown: zig-zag between 4 points on the table and 7 on the girdle
    tx = [cx + f * ht for f in (-1, -0.36, 0.36, 1)]
    gx = [cx + f * w / 2 for f in (-1, -0.68, -0.34, 0, 0.34, 0.68, 1)]
    pairs = [(0, 1), (1, 1), (1, 2), (1, 3), (2, 3), (2, 4), (2, 5), (3, 5)]
    for i, j in pairs:
        dr.add(step + "-couronne" + m, seg_d((tx[i], yt), (gx[j], yg - g / 2)), W_FINE)
    # pavilion: mains to the culet, lower girdle facets as short V's
    for f in (-0.5, 0, 0.5):
        dr.add(step + "-pavillon" + m, seg_d((cx + f * w / 2, yb), (cx, yc)), W_FINE)
    for f in (-0.75, -0.25, 0.25, 0.75):
        x0 = cx + f * w / 2
        dr.add(step + "-pavillon" + m, seg_d((x0, yb), (cx + (x0 - cx) * 0.35, yb + hp * 0.65)), W_FINE)
    return dict(yt=yt, yg=yg, yc=yc, ht=ht, hw=w / 2)


def anatomie():
    dr = Drawing()
    brilliant_profile(dr, 500, 440, 760)
    return dr


# ---------------------------------------------------------------- carats to scale
# Approximate diameters of well-cut round brilliants (mm). Widely published industry averages;
# a real stone varies with its cut (always say "environ").
CARAT_MM = [(0.5, 5.2), (0.75, 5.8), (1.0, 6.5), (1.25, 6.9), (1.5, 7.4), (2.0, 8.2), (2.5, 8.8),
            (3.0, 9.3), (3.5, 9.8), (4.0, 10.2), (5.0, 11.0)]
MM = 70.0                                   # viewBox units per millimetre, same for every carat file


def carat(ct):
    mm = dict(CARAT_MM)[ct]
    dr = Drawing()
    R = mm * MM / 2
    o = outline_round(R)
    dr.add("contour", poly_d(o), W_OUT, fill=True)
    brilliant(dr, o)
    return dr


# ---------------------------------------------------------------- rings in profile
RC = (500.0, 650.0)                         # centre of the band circle
RO, RI = 250.0, 214.0                       # outer / inner radius of the shank


def _prong(cx, side, y0, y1, ytip, xg):
    """Tapered claw from the head base (y0) up past the girdle (xg at y1) to a rounded tip (ytip)."""
    s = side
    base_o, base_i = cx + s * (xg - 60), cx + s * (xg - 82)
    pts = (f"M{P(base_i, y0)} C{P(base_i, y0 - 40)} {P(cx + s * (xg - 18), y1 + 40)} {P(cx + s * (xg - 6), y1)} "
           f"L{P(cx + s * (xg - 10), ytip + 8)} Q{P(cx + s * (xg - 2), ytip - 6)} {P(cx + s * (xg + 10), ytip + 6)} "
           f"L{P(cx + s * (xg + 12), y1)} C{P(cx + s * (xg + 4), y1 + 50)} {P(base_o + s * 6, y0 - 50)} {P(base_o, y0)} Z")
    return pts


def ring_profile(style):
    """style: solitaire | cathedrale | hidden-halo | demi-eternite | trois-quarts | hidden-halo-demi |
    hidden-halo-trois-quarts | alliance-demi | alliance-trois-quarts | alliance-complete"""
    dr = Drawing()
    cx, cy = RC
    alliance = style.startswith("alliance")
    halo = "hidden-halo" in style
    cath = style == "cathedrale"
    holes_band, holes_stone = [], []

    # band stones (profile, tables facing out) ------------------------------------------------
    arcs = []
    top = -math.pi / 2
    gap = 0 if alliance else math.radians(19)
    if style in ("demi-eternite", "hidden-halo-demi", "alliance-demi"):
        arcs = [(top - math.pi / 2, top - gap), (top + gap, top + math.pi / 2)] if gap else [(top - math.pi / 2, top + math.pi / 2)]
    elif style in ("trois-quarts", "hidden-halo-trois-quarts", "alliance-trois-quarts"):
        arcs = [(top - 3 * math.pi / 4, top - gap), (top + gap, top + 3 * math.pi / 4)] if gap else [(top - 3 * math.pi / 4, top + 3 * math.pi / 4)]
    elif style == "alliance-complete":
        arcs = [(top, top + TAU)]
    band_stones = []
    sg = 27.0                                # small stone girdle diameter (units)
    step = (sg + 4.0) / RO
    for a0, a1 in arcs:
        n = int((a1 - a0) / step)
        off = ((a1 - a0) - n * step) / 2 + step / 2
        for i in range(n):
            band_stones.append(a0 + off + i * step)
    for phi in band_stones:
        u = (math.cos(phi), math.sin(phi))
        t = (-u[1], u[0])
        def pt(r, s_):
            return (cx + u[0] * r + t[0] * s_, cy + u[1] * r + t[1] * s_)
        # only the crown shows: the girdle sits on the shank, the pavilion is hidden in the metal
        crown = [pt(RO, -sg / 2), pt(RO + 7.5, -sg * 0.29), pt(RO + 7.5, sg * 0.29), pt(RO, sg / 2)]
        dr.add("pierres-anneau", poly_d(crown, closed=False), W_FINE, fill=True)
        dr.add("pierres-anneau", seg_d(pt(RO + 7.5, -sg * 0.08), pt(RO, -sg * 0.3)), W_FINE * 0.7)
        dr.add("pierres-anneau", seg_d(pt(RO + 7.5, sg * 0.08), pt(RO, sg * 0.3)), W_FINE * 0.7)
    for i in range(len(band_stones) - 1):    # shared prongs: a bead between neighbours
        a, b = band_stones[i], band_stones[i + 1]
        if b - a < step * 1.5:
            m = (a + b) / 2
            bx, by = cx + math.cos(m) * (RO + 4.5), cy + math.sin(m) * (RO + 4.5)
            dr.add("griffes-anneau", circle_d(bx, by, 3.0), W_FINE, fill=True)

    # head ---------------------------------------------------------------------------------------
    if not alliance:
        w = 228.0
        yg = cy - RO - 128
        ht = w * 0.28
        g = 4.0
        yt = yg - g / 2 - w * 0.15
        yc = yg + g / 2 + w * 0.43
        ybase = cy - RO + 14
        prongs = [_prong(cx, s, ybase, yg, yt - 4, w / 2) for s in (-1, 1)]
        holes_stone += prongs
        rail_y = yg + 44
        rail = poly_d([(cx - 86, rail_y), (cx + 86, rail_y), (cx + 80, rail_y + 13), (cx - 80, rail_y + 13)])
        if halo:                              # hidden halo: a frame of small stones just under the girdle
            hy0, hy1 = yg + 7, yg + 30
            frame = poly_d([(cx - w / 2 + 8, hy0), (cx + w / 2 - 8, hy0), (cx + w / 2 - 22, hy1), (cx - w / 2 + 22, hy1)])
            holes_stone.append(frame)
        else:
            holes_stone.append(rail)
        dr.masks["m-pierre"] = holes_stone
        brilliant_profile(dr, cx, yg, w, step="pierre", mask="m-pierre", girdle=g)
        if halo:
            dr.add("halo-cache", frame, W_FAC)
            n = 7
            for i in range(n):
                x = cx - w / 2 + 34 + i * (w - 68) / (n - 1)
                r = 9.0 - 1.6 * abs(i - (n - 1) / 2) / ((n - 1) / 2)
                dr.add("halo-cache", circle_d(x, (hy0 + hy1) / 2, r), W_FINE, fill=True)
                dr.add("halo-cache", poly_d([(x + r * 0.55 * math.cos(k * math.pi / 4 + math.pi / 8),
                                               (hy0 + hy1) / 2 + r * 0.55 * math.sin(k * math.pi / 4 + math.pi / 8))
                                              for k in range(8)]), W_FINE * 0.7)
        if not halo:
            dr.add("tete", rail, W_FAC)
        for p in prongs:
            dr.add("griffes", p, W_FAC, fill=True)
        # basket base where the claws meet the shank
        dr.add("tete", f"M{P(cx - 62, ybase)} Q{P(cx, ybase + 10)} {P(cx + 62, ybase)}", W_FAC)
        holes_band.append(poly_d([(cx - 80, ybase - 6), (cx + 80, ybase - 6), (cx + 64, ybase + 8), (cx - 64, ybase + 8)]))
        if cath:                              # cathedral: the shoulders rise as arches into the head
            for s in (-1, 1):
                a_o = -math.pi / 2 + s * math.radians(42)
                a_i = -math.pi / 2 + s * math.radians(30)
                po = (cx + RO * math.cos(a_o), cy + RO * math.sin(a_o))
                pi_ = (cx + RO * math.cos(a_i), cy + RO * math.sin(a_i))
                outer = (f"M{P(*po)} C{P(po[0] - s * 8, po[1] - 60)} {P(cx + s * 120, rail_y + 60)} "
                         f"{P(cx + s * 92, rail_y + 8)}")
                inner = (f"M{P(*pi_)} C{P(pi_[0] - s * 6, pi_[1] - 30)} {P(cx + s * 92, rail_y + 70)} "
                         f"{P(cx + s * 78, rail_y + 16)}")
                dr.add("cathedrale", outer, W_OUT)
                dr.add("cathedrale", inner, W_FAC)

    # shank --------------------------------------------------------------------------------------
    dr.masks["m-anneau"] = holes_band
    dr.add("anneau@m-anneau", circle_d(cx, cy, RO), W_OUT)
    dr.add("anneau", circle_d(cx, cy, RI), W_OUT)
    # paint order: shank first, then the head on top
    order = ["anneau", "pierres-anneau", "griffes-anneau", "cathedrale", "tete", "pierre", "halo-cache", "griffes"]
    def rank(layer):
        g = layer[0].partition("@")[0]
        for i, o in enumerate(order):
            if g == o or g.startswith(o + "-"):
                return i
        return len(order)
    dr.layers.sort(key=rank)
    return dr


RINGS = ["solitaire", "cathedrale", "hidden-halo", "demi-eternite", "trois-quarts", "hidden-halo-demi",
         "hidden-halo-trois-quarts", "alliance-demi", "alliance-trois-quarts", "alliance-complete"]



# ---------------------------------------------------------------- rings seen from the top (on the hand)
def _small_round(dr, group, x, y, r):
    dr.add(group, circle_d(x, y, r), W_FINE, fill=True)
    dr.add(group, poly_d([(x + r * 0.52 * math.cos(k * math.pi / 4 + math.pi / 8), y + r * 0.52 * math.sin(k * math.pi / 4 + math.pi / 8))
                          for k in range(8)]), W_FINE * 0.7)


def ring_top(style):
    """style: solitaire | halo | demi-eternite | halo-demi. A hidden halo looks exactly like the solitaire from the top."""
    dr = Drawing()
    R = 150.0
    halo = style.startswith("halo")
    pave = style.endswith("demi-eternite") or style.endswith("demi")
    head_r = R + (46 if halo else 14)
    # band: a strip on each side of the head, slightly narrower at the edges (it curves away)
    holes = [circle_d(500, 500, head_r)]
    dr.masks["m-jonc"] = holes
    for s in (-1, 1):
        x0, x1 = 500 + s * 60, 500 + s * 440
        dr.add("jonc@m-jonc", f"M{P(x0, 468)} L{P(x1, 476)}", W_OUT)
        dr.add("jonc@m-jonc", f"M{P(x0, 532)} L{P(x1, 524)}", W_OUT)
    if pave:
        for s in (-1, 1):
            n = 7
            for i in range(n):
                x = 500 + s * (head_r + 34 + i * 41)
                if abs(x - 500) > 430:
                    continue
                rr = 17.5 - i * 0.35
                _small_round(dr, "pierres-jonc", x, 500, rr)
                if i < n - 1:
                    for yy in (500 - rr - 1.5, 500 + rr + 1.5):
                        dr.add("griffes-jonc", circle_d(x + s * 20.5, yy, 3.0), W_FINE, fill=True)
    if halo:
        rh = R + 23
        dr.add("halo", circle_d(500, 500, R + 44), W_FAC)
        n = int(2 * math.pi * rh / 36)
        for k in range(n):
            a = 2 * math.pi * k / n
            _small_round(dr, "halo", 500 + rh * math.cos(a), 500 + rh * math.sin(a), 15.5)
    o = outline_round(R)
    dr.add("pierre-contour", poly_d(o), W_OUT, fill=True)
    brilliant(dr, o, step="pierre")
    for a in (45, 135, 225, 315):
        t = math.radians(a)
        dr.add("griffes", circle_d(500 + (R - 2) * math.cos(t), 500 + (R - 2) * math.sin(t), 14), W_FAC, fill=True)
    return dr


RINGS_TOP = ["solitaire", "halo", "demi-eternite", "halo-demi"]

def all_drawings():
    out = {}
    for s in SHAPES:
        out[f"forme_{s}"] = stone_top(s)
    out["anatomie_rond-brillant"] = anatomie()
    for ct, mm in CARAT_MM:
        out[f"carat_{round(ct * 100):03d}"] = carat(ct)          # carat_050 = 0,5 ct ... carat_500 = 5 ct
    for r in RINGS:
        out[f"bague_profil_{r}"] = ring_profile(r)
    for r in RINGS_TOP:
        out[f"bague_dessus_{r}"] = ring_top(r)
    return out


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "schemas_out"
    drawings = all_drawings()
    for cw, (line, fill) in COLORWAYS.items():
        os.makedirs(f"{out}/{cw}", exist_ok=True)
        for name, dr in drawings.items():
            open(f"{out}/{cw}/{name}.svg", "w").write(dr.svg(line, fill))
    print(f"{len(drawings)} drawings x {len(COLORWAYS)} colourways -> {out}")
