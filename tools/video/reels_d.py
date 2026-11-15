"""Wave 4 — oval ring: 3D render vs real photos, CAD angles, hidden halo explainer.
Usage: python3 reels_d.py [D01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, endcard, end_tl, end_solid, FR_END

REELS = {}
R_SIDE = "img:14677909-image.jpg"     # render: oval, hidden halo, plain shank (+ wedding band), side view
P_FRONT = "img:6785b0ea-image.jpg"    # real photo: finished oval, yellow gold, front (gloved hand)
P_SIDE = "img:54566917-image.jpg"     # real photo: same ring, side profile (hidden halo visible)
R_PAVE = "img:5cb47fe1-image.jpg"     # render: oval with pavé band (different design)
CAD2 = "u:ff494d11-VIDEO-2026-10-27-22-13-38.mp4"   # CAD turntable of the oval pavé design (604x574)


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def s(clip, start, dur, **kw):
    return ("shot", S(clip, start, dur, **kw))


@reel
def D01_rendu_vs_realite():
    items = [s(R_SIDE, 0, 2.0, fit=True, fx=["kenburns"]),
             s(P_SIDE, 0, 2.5, fx=["flash", "kenburns"]),
             s(P_FRONT, 0, 2.0, fx=["punch", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Le rendu <i>3D</i>…", over="Design 3D en 48 h", size="s100"),
         "c": card("… la vraie <i>bague</i>.", over="Ovale · or jaune · halo caché", size="s100")}
    L.update(endcard("Du rendu <i>à ta main.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c", 2.0, 0.08, 6.5, 0, 0)] + end_tl(6.5, 9.0)
    au = ([(0.1, "sparkle", 0.5), (1.98, "whoosh_rev"), (2.0, "impact", 0.8), (2.05, "sparkle"), (4.5, "tick"),
           (6.5, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def D02_angles_3d():
    items = [s(CAD2, 0.0, 2.5, fit=True, fitbg="0xFFFFFF", fx=["kenburns"]),
             s(CAD2, 6.0, 2.0, fit=True, fitbg="0xFFFFFF", fx=["flash"]),
             s(CAD2, 18.2, 1.5, fit=True, fitbg="0xFFFFFF", fx=["punch"]),
             s(R_PAVE, 0, 2.0, fit=True, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Ta bague, vue sous<br>tous les <i>angles</i>.", over="Avant la fabrication", size="s86"),
         "c": card("Chaque détail,<br><i>validé avec toi</i>.", over="Révisions incluses", size="s86")}
    L.update(endcard("Design 3D <i>en 48 h.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.12, 8.0, 0, 12)] + end_tl(8.0, 10.5)
    au = ([(0.2, "sparkle", 0.5), (2.48, "whoosh_rev"), (2.5, "impact", 0.6), (4.5, "tick"), (6.0, "whoosh_rev", 0.5),
           (6.0, "sparkle", 0.6), (8.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def D03_halo_cache():
    items = [s(P_SIDE, 0, 2.5, zoom=1.35, cx=700, cy=1000, fx=["kenburns"]),
             s(CAD2, 6.2, 2.5, fit=True, fitbg="0xFFFFFF", fx=["flash"]),
             s(P_FRONT, 0, 2.0, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Le halo <i>caché</i>,<br>c’est quoi ?", over="Bague de fiançailles", size="s86"),
         "c1": card("Une rangée de petites pierres<br><i>sous</i> la pierre centrale.", size="s62", det="Visible de côté, discrète de face."),
         "c2": card("De face :<br>la pierre, <i>seule</i>.", size="s86")}
    L.update(endcard("Ton style, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c1", 2.5, 0.15, 5.0, 0, 12), ("c2", 5.0, 0.15, 7.0, 0, 12)] + end_tl(7.0, 9.5)
    au = ([(0.2, "sparkle", 0.5), (2.5, "whoosh_rev", 0.6), (2.55, "sparkle", 0.6), (5.0, "whoosh_rev", 0.6),
           (5.05, "sparkle", 0.7), (7.0, "impact", 0.5)], "edu")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
