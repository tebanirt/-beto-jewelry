"""Wave 7 — lifestyle (Mont-Tremblant), lotus basket render vs real, hidden details, emerald, marquise styles.
Usage: python3 reels_g.py [G01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, label, endcard, end_tl, end_solid, FR_END

REELS = {}
T_OVPAVE, T_MQALT, T_MQSIDE, T_OVPLAIN = ("img:761f226b-image.jpg", "img:4e1768ba-image.jpg",
                                          "img:21e5b775-image.jpg", "img:8e1064f9-image.jpg")   # outdoor lifestyle
R_LOTUS = "img:555ac6e3-image.jpg"     # render: marquise solitaire, petal (lotus) basket
P_LOTUS = "img:60c85281-image.jpg"     # photo: same design, end view
P_UNDER = "img:002c71b8-image.jpg"     # photo: openwork underside of a marquise setting
P_SIDE_ALT = "img:6643f215-image.jpg"  # photo: marquise, alternating band, side (hidden halo)
P_SIDE_HALO = "img:241cce9f-image.jpg" # photo: marquise, hidden halo, side
EM_BOX, EM_CLOSE = "img:3a9c9935-image.jpg", "img:67dd756f-image.jpg"   # emerald cut in LED box
MQ_ALT, MQ_WIDE, MQ_SOL = "img:650d2b9f-image.jpg", "img:143bf367-image.jpg", "img:e9997fda-image.jpg"
POS = {T_OVPAVE: (850, 1180), T_MQALT: (760, 950), T_MQSIDE: (810, 960), T_OVPLAIN: (760, 860),
       P_LOTUS: (760, 900), P_UNDER: (760, 1000), P_SIDE_ALT: (760, 1050), P_SIDE_HALO: (740, 900),
       EM_BOX: (740, 1000), EM_CLOSE: (750, 960), MQ_ALT: (760, 930), MQ_WIDE: (760, 980), MQ_SOL: (690, 900)}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def photo(p, dur, z=1.2, **kw):
    cx, cy = POS.get(p, (756, 1008))
    return ("shot", S(p, 0, dur, zoom=z, cx=cx, cy=cy, **kw))


@reel
def G01_imagine_ici():
    items = [photo(T_OVPLAIN, 2.5, z=1.0, fx=["kenburns"]), photo(T_OVPAVE, 1.75, z=1.0, fx=["flash", "kenburns"]),
             photo(T_MQSIDE, 1.75, z=1.0, fx=["flash", "kenburns"]), photo(T_MQALT, 1.5, z=1.0, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Imagine ta demande <i>ici</i>.", size="s86"),
         "c": card("On s’occupe<br>de la <i>bague</i>.", size="s86")}
    L.update(endcard("Envoie ça à quelqu’un<br>qui doit faire <i>la demande</i>.", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.15, 7.5, 0, 12)] + end_tl(7.5, 10.0)
    au = ([(0.2, "sparkle", 0.5), (2.48, "whoosh_rev", 0.6), (2.5, "impact", 0.6), (4.25, "sparkle", 0.5), (6.0, "sparkle", 0.5),
           (7.5, "impact", 0.5)], "ambient")
    return items, L, tl, au


@reel
def G02_lotus_rendu_vs_reel():
    items = [("shot", S(R_LOTUS, 0, 2.5, fit=True, fx=["kenburns"])), photo(P_LOTUS, 2.5, z=1.4, fx=["flash", "kenburns"]),
             photo(P_UNDER, 1.5, z=1.4, fx=["punch", "flash_out"]), end_solid(2.5)]
    L = {"h": card("Le rendu <i>3D</i>…", over="Marquise · griffes en pétales", size="s100"),
         "c": card("… la vraie <i>bague</i>.", size="s100")}
    L.update(endcard("Du rendu <i>à ta main.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.08, 6.5, 0, 0)] + end_tl(6.5, 9.0)
    au = ([(0.1, "sparkle", 0.5), (2.48, "whoosh_rev"), (2.5, "impact", 0.8), (2.55, "sparkle"), (5.0, "tick"),
           (6.5, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def G03_details_caches():
    items = [photo(P_UNDER, 2.5, z=1.4, fx=["kenburns"]), photo(P_SIDE_ALT, 1.75, z=1.3, fx=["flash", "kenburns"]),
             photo(P_SIDE_HALO, 1.75, z=1.4, fx=["flash", "kenburns"]), photo(P_LOTUS, 1.5, z=1.4, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Le dessous de ta bague,<br><i>aussi beau</i> que le dessus.", size="s72"),
         "l1": label(1, "Halo caché"), "l2": label(2, "Vue de côté"), "l3": label(3, "Griffes en pétales")}
    L.update(endcard("Chaque détail, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("l1", 2.5, 0.1, 4.25, 0, 10), ("l2", 4.25, 0.1, 6.0, 0, 10), ("l3", 6.0, 0.1, 7.5, 0, 10)] + end_tl(7.5, 10.0)
    au = ([(0.2, "sparkle", 0.5), (2.5, "whoosh_rev", 0.5), (2.55, "sparkle", 0.5), (4.25, "tick"), (6.0, "tick"),
           (7.5, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def G04_emeraude():
    items = [photo(EM_BOX, 2.5, z=1.1, fx=["kenburns"]), photo(EM_CLOSE, 3.0, z=1.15, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Taille <i>émeraude</i>.", size="s100"),
         "c": card("La lumière,<br><i>en escalier</i>.", det="Des facettes en marches, pour un éclat net et graphique.", size="s86")}
    L.update(endcard("Ta taille, <i>ta bague.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.2, 5.5, 0, 12)] + end_tl(5.5, 8.0)
    au = ([(0.3, "sparkle", 0.6), (2.48, "whoosh_rev", 0.5), (2.5, "sparkle", 0.8), (5.5, "impact", 0.5)], "ambient")
    return items, L, tl, au


@reel
def G05_marquise_3_styles():
    items = [photo(MQ_SOL, 2.0, z=1.35, fx=["kenburns"]), photo(MQ_WIDE, 1.5, z=1.35, fx=["flash", "punch"]),
             photo(MQ_ALT, 1.5, z=1.35, fx=["flash", "punch"]), photo(T_MQALT, 1.5, z=1.0, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("La marquise,<br><i>3 styles</i>.", size="s100"),
         "l1": label(1, "Solitaire"), "l2": label(2, "Anneau large"), "l3": label(3, "Pierres alternées"),
         "q": card("Ta préférée ? <i>1, 2 ou 3</i>", size="s72")}
    L.update(endcard("Ta marquise, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 1.0, 0, 0), ("l1", 1.0, 0.1, 2.0, 0, 10), ("l2", 2.0, 0.1, 3.5, 0, 10), ("l3", 3.5, 0.1, 5.0, 0, 10),
          ("q", 5.0, 0.12, 6.5, 0, 10)] + end_tl(6.5, 9.0)
    au = ([(0.1, "sparkle", 0.5), (2.0, "impact", 0.6), (3.5, "impact", 0.6), (5.0, "whoosh_rev", 0.5), (5.0, "sparkle"),
           (6.5, "impact", 0.5)], "lux")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
