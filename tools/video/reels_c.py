"""Wave 3 — making-of: 3D render -> CAD animation -> raw gold casting (marquise ring, Nov 2026).
Usage: python3 reels_c.py [C01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, endcard, end_tl, end_solid, FR_END, EN_END

REELS = {}
IMG1 = "img:2330f1a8-image.jpg"      # render: marquise, yellow gold, marquise side stones
IMG2 = "img:14677909-image.jpg"      # render: oval, hidden halo + eternity band (side view)
CAD = "u:118b50e3-VIDEO-2026-11-01-11-01-49.mp4"   # MatrixGold turntable of the marquise ring (574x552)
CAST = "u:dec72787-IMG_5717.mov"     # raw gold casting of the marquise setting (HDR 1080x1920)
CAST2 = "u:dbf2e9b9-IMG_5715.mov"
BANDS = "u:2fbe1cf2-IMG_5712.mov"    # raw cast eternity bands


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def s(clip, start, dur, **kw):
    return ("shot", S(clip, start, dur, **kw))


def cast(t, dur, cx, cy, z=1.8, **kw):
    return s(CAST, t, dur, zoom=z, cx=cx, cy=cy, **kw)


@reel
def C01_rendu_a_or():
    items = [s(IMG1, 0, 2.0, fit=True, fx=["kenburns"]),
             s(CAD, 9.7, 2.5, fit=True, fx=["flash"]),
             cast(0.2, 2.5, 532, 1248, fx=["flash", "kenburns"]),
             cast(11.6, 1.0, 440, 1260, fx=["punch"]),
             s(BANDS, 12.0, 1.0, zoom=1.7, cx=400, cy=1200, fx=["punch"]),
             cast(15.2, 1.0, 480, 1220, fx=["punch", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Ta bague existe<br>avant d’<i>exister</i>.", over="Design 3D en 48 h", size="s86"),
         "c1": card("On la dessine en <i>3D</i>.", over="01 — Le design", det="Révisions incluses"),
         "c2": card("Puis elle prend vie<br>en <i>or</i>.", over="02 — La fonte"),
         "c3": card("Prochaine étape :<br>les <i>pierres</i>.", over="03 — Le sertissage")}
    L.update(endcard("De l’idée <i>à l’or.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.15, 4.5, 0, 12), ("c2", 4.5, 0.15, 7.0, 0, 12),
          ("c3", 7.0, 0.15, 10.0, 0, 12)] + end_tl(10.0, 12.5)
    au = ([(1.98, "whoosh_rev"), (2.0, "impact", 0.6), (4.48, "whoosh_rev"), (4.5, "impact", 0.7), (4.55, "sparkle"),
           (7.0, "tick"), (8.0, "tick"), (9.0, "tick"), (10.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def C02_avant_apres():
    top = S(IMG1, 0, 5.0, fx=["kenburns"])
    bottom = S(CAST, 0.2, 5.0, zoom=3.0, cx=532, cy=1248)
    items = [("stack", (top, bottom, 5.0)), end_solid(2.5)]
    L = {"t": card("Le rendu <i>3D</i>.", size="s72", top=300),
         "b": card("La même bague,<br>sortie de la <i>fonte</i>.", size="s62", top=1000)}
    L.update(endcard("De l’écran <i>à ta main.</i>", None, **FR_END))
    tl = [("t", 0, 0, 5.0, 0, 0), ("b", 1.5, 0.25, 5.0, 0, 12)] + end_tl(5.0, 7.5)
    au = ([(0.1, "sparkle", 0.6), (1.5, "whoosh_rev", 0.5), (1.5, "impact", 0.5), (3.5, "tick"), (5.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def C03_fonte_velocity():
    q = 0.5
    items = [cast(0.2, q, 532, 1248, fx=["punch", "shake"]), cast(3.0, q, 632, 1240, fx=["punch", "rgb"]),
             cast(9.0, q, 300, 1240, fx=["punch"]), s(CAST2, 0.5, q, zoom=1.8, cx=468, cy=1100, fx=["punch", "rgb"]),
             s(CAST2, 6.3, q, zoom=1.8, cx=400, cy=980, fx=["punch"]), s(BANDS, 1.0, q, zoom=1.7, cx=460, cy=1020, fx=["punch", "rgb"]),
             s(BANDS, 12.3, q, zoom=1.7, cx=400, cy=1200, fx=["punch"]), s(BANDS, 19.7, q, zoom=1.7, cx=420, cy=1240, fx=["punch", "rgb"]),
             cast(12.0, q, 440, 1260, fx=["punch"]), cast(15.5, q, 480, 1220, fx=["punch", "flash_out"]),
             end_solid(2.0)]
    L = {"a": card("Sortie de la <i>fonte</i>.", size="s100"),
         "b": card("Prochaine étape :<br>les <i>pierres</i>.", size="s86")}
    L.update(endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    tl = [("a", 0, 0, 2.5, 0, 0), ("b", 2.5, 0.08, 5.0, 0, 0)] + end_tl(5.0, 7.0)
    au = ([(0.0, "impact"), (2.5, "impact", 0.8), (2.55, "sparkle"), (5.0, "impact", 0.7)] +
          [(0.5 * i, "tick", 0.8) for i in range(1, 10)], "velocity")
    return items, L, tl, au


@reel
def C04_EN_render_to_gold():
    items = [s(CAD, 0.2, 2.0, fit=True, fx=["kenburns"]),
             s(IMG1, 0, 2.5, fit=True, fx=["flash", "kenburns"]),
             cast(0.2, 2.5, 532, 1248, fx=["flash", "kenburns"]),
             s(BANDS, 19.4, 1.0, zoom=1.7, cx=420, cy=1240, fx=["punch"]),
             cast(11.6, 1.0, 440, 1260, fx=["punch"]),
             cast(15.2, 1.0, 480, 1220, fx=["punch", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Your ring exists<br>before it <i>exists</i>.", over="3D design in 48 h", size="s86"),
         "c1": card("We design it in <i>3D</i>.", over="01 — Design", det="Revisions included"),
         "c2": card("Then it comes to life<br>in <i>gold</i>.", over="02 — Casting"),
         "c3": card("Next step:<br>the <i>stones</i>.", over="03 — Setting")}
    L.update(endcard("From idea <i>to gold.</i>", None, **EN_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.15, 4.5, 0, 12), ("c2", 4.5, 0.15, 7.0, 0, 12),
          ("c3", 7.0, 0.15, 10.0, 0, 12)] + end_tl(10.0, 12.5)
    au = ([(1.98, "whoosh_rev"), (2.0, "impact", 0.6), (4.48, "whoosh_rev"), (4.5, "impact", 0.7), (4.55, "sparkle"),
           (7.0, "tick"), (8.0, "tick"), (9.0, "tick"), (10.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def C05_design_48h():
    items = [s(IMG2, 0, 2.5, fit=True, fx=["kenburns"]),
             s(IMG1, 0, 1.5, fit=True, fx=["flash", "punch"]),
             s(CAD, 22.7, 2.5, fit=True, fx=["flash"]),
             end_solid(2.5)]
    L = {"h": card("Ton design en <i>48 h</i>.", over="Design 3D sur mesure", size="s86"),
         "c": card("Révisions <i>incluses</i>,<br>jusqu’à ce qu’il soit parfait.", size="s72")}
    L.update(endcard("Raconte-nous <i>ton idée.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.15, 6.5, 0, 12)] + end_tl(6.5, 9.0)
    au = ([(0.2, "sparkle", 0.6), (2.48, "whoosh_rev"), (2.5, "impact", 0.6), (4.0, "whoosh_rev", 0.5), (4.0, "sparkle", 0.6),
           (6.5, "impact", 0.5)], "lux")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
