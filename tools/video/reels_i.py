"""Wave 9 — Christmas (approved ad copy, brief §6: order by December 11).
Usage: python3 reels_i.py [I01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, endcard, end_tl, end_solid, FR_END, EN_END

REELS = {}
BOX1, BOX2 = "img:44e2c708-image.jpg", "img:ef0863dd-image.jpg"   # oval in blue LED box, outdoors
CUS_F, EM_F, PEAR = "img:14712e3f-image.jpg", "img:3b236e76-image.jpg", "img:18ea6566-image.jpg"
VIN_F, MQ_F = "img:8dfe3461-image.jpg", "img:70e308db-image.jpg"
OVPAVE, P3S = "img:1c6e1795-image.jpg", "img:ce39d97b-image.jpg"
POS = {BOX1: (760, 1000), BOX2: (770, 1000), CUS_F: (790, 1000), EM_F: (810, 900), PEAR: (730, 910),
       VIN_F: (790, 900), MQ_F: (760, 900), OVPAVE: (680, 950), P3S: (750, 1000)}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def photo(p, dur, z=1.3, **kw):
    cx, cy = POS[p]
    return ("shot", S(p, 0, dur, zoom=z, cx=cx, cy=cy, **kw))


def _sapin(lang):
    fr = lang == "fr"
    items = [photo(BOX2, 2.5, z=1.0, fx=["kenburns"]),
             photo(CUS_F, 0.75, fx=["flash", "punch"]), photo(EM_F, 0.75, fx=["punch"]), photo(PEAR, 0.75, fx=["punch"]),
             photo(VIN_F, 0.75, z=1.0, fx=["punch"]), photo(BOX1, 2.0, z=1.1, fx=["flash", "kenburns", "flash_out"]),
             end_solid(3.0)]
    if fr:
        L = {"h": card("Une bague sur mesure<br>sous le <i>sapin</i> ?", over="Noël 2026", size="s86"),
             "c1": card("Design 3D en <i>48 h</i>,<br>bague prête en <i>2 semaines</i>.", size="s72"),
             "c2": card("Commandez avant<br>le <i>11 décembre</i>.", size="s86")}
        L.update(endcard("Commandez avant<br>le <i>11 décembre.</i>", None, **FR_END))
    else:
        L = {"h": card("A custom ring<br>under the <i>tree</i>?", over="Christmas 2026", size="s86"),
             "c1": card("3D design in <i>48 h</i>,<br>ready in <i>2 weeks</i>.", size="s72"),
             "c2": card("Order by<br><i>December 11</i>.", size="s86")}
        L.update(endcard("Order by<br><i>December 11.</i>", None, **EN_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c1", 2.5, 0.12, 5.5, 0, 12), ("c2", 5.5, 0.15, 7.5, 0, 12)] + end_tl(7.5, 10.5)
    au = ([(0.2, "sparkle", 0.7), (2.48, "whoosh_rev"), (2.5, "impact", 0.7), (3.25, "tick"), (4.0, "tick"), (4.75, "tick"),
           (5.5, "impact", 0.7), (5.55, "sparkle"), (7.5, "impact", 0.5), (7.6, "sparkle", 0.6)], "lux")
    return items, L, tl, au


@reel
def I01_noel_sapin():
    return _sapin("fr")


@reel
def I02_EN_under_the_tree():
    return _sapin("en")


@reel
def I03_noel_velocity():
    seq = [MQ_F, CUS_F, EM_F, PEAR, OVPAVE, P3S, VIN_F, MQ_F, CUS_F, EM_F]
    items = [photo(p, 0.5, z=1.5 if p != VIN_F else 1.1, fx=["punch"] + (["rgb"] if i % 3 == 1 else []) + (["shake"] if i in (0, 5) else []))
             for i, p in enumerate(seq)] + [photo(BOX1, 1.5, z=1.1, fx=["flash", "kenburns", "flash_out"]), end_solid(2.5)]
    L = {"a": card("Noël <i>approche</i>.", size="s100"),
         "b": card("Ta bague, <i>sur mesure</i>,<br>prête en 2 semaines.", size="s72"),
         "c": card("Commandez avant<br>le <i>11 décembre</i>.", size="s86")}
    L.update(endcard("Commandez avant<br>le <i>11 décembre.</i>", None, **FR_END))
    tl = [("a", 0, 0, 2.5, 0, 0), ("b", 2.5, 0.06, 5.0, 0, 0), ("c", 5.0, 0.1, 6.5, 0, 10)] + end_tl(6.5, 9.0)
    au = ([(0.0, "impact"), (2.5, "impact", 0.8), (2.55, "sparkle"), (5.0, "impact", 0.8), (5.05, "sparkle"), (6.5, "impact", 0.6)] +
          [(0.5 * i, "tick", 0.8) for i in range(1, 10)], "velocity")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
