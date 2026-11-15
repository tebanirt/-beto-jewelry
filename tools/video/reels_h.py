"""Wave 8 — cushion & baguettes, emerald, vintage marquise, pear pavé, eternity band, hoops, engraving, box reveal.
Usage: python3 reels_h.py [H01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, label, num, endcard, end_tl, end_solid, FR_END, EN_END

REELS = {}
CUS_F, CUS_S = "img:14712e3f-image.jpg", "img:cc29454f-image.jpg"   # cushion + tapered baguettes, yellow gold
EM_S, EM_F = "img:09febe54-image.jpg", "img:3b236e76-image.jpg"     # emerald cut, white metal
HOOP_F, HOOP_S = "img:71d602f6-image.jpg", "img:e0838029-image.jpg" # diamond hoops
VIN_F, VIN_S = "img:8dfe3461-image.jpg", "img:f24a29df-image.jpg"   # vintage marquise (milgrain, engraved band)
MQ_F, MQ_S = "img:70e308db-image.jpg", "img:24415bb1-image.jpg"     # marquise solitaire
PEAR = "img:18ea6566-image.jpg"                                     # pear, pavé band, white metal
ETER1, ETER2 = "img:8214c53f-image.jpg", "img:e4df707d-image.jpg"   # eternity band
ENGR = "img:bbad55ee-image.jpg"                                     # engraved message inside a band
BOX1, BOX2 = "img:44e2c708-image.jpg", "img:ef0863dd-image.jpg"     # oval + marquise accents, blue LED box, outdoors
POS = {CUS_F: (790, 1000), CUS_S: (720, 1080), EM_S: (800, 900), EM_F: (810, 900), HOOP_F: (760, 1060),
       HOOP_S: (760, 920), VIN_F: (790, 900), VIN_S: (770, 1000), MQ_F: (760, 900), MQ_S: (730, 880),
       PEAR: (730, 910), ETER1: (800, 1100), ETER2: (820, 1100), ENGR: (900, 950), BOX1: (760, 1000), BOX2: (770, 1000)}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def photo(p, dur, z=1.3, **kw):
    cx, cy = POS.get(p, (756, 1008))
    return ("shot", S(p, 0, dur, zoom=z, cx=cx, cy=cy, **kw))


@reel
def H01_laquelle_4():
    cells = [S(p, 0, 5.0, zoom=1.5, cx=POS[p][0], cy=POS[p][1], fx=["kenburns"]) for p in (CUS_F, EM_F, PEAR, VIN_F)]
    items = [("grid", (cells, 5.0, [])), end_solid(2.0)]
    L = {"q": card("Laquelle tu <i>choisis</i> ?", size="s72", top=850),
         "n": num(1, 66, 300) + num(2, 612, 300) + num(3, 66, 1010) + num(4, 612, 1010),
         "r": card("Coussin, émeraude, poire<br>ou marquise vintage ?", size="s62", top=1080)}
    L.update(endcard("Ta forme, <i>ta bague.</i>", None, **FR_END))
    tl = [("q", 0, 0, 5.0, 0, 0), ("n", 0, 0, 5.0, 0, 0), ("r", 1.0, 0.3, 5.0, 0, 12)] + end_tl(5.0, 7.0)
    au = ([(0.0, "sparkle", 0.6), (1.0, "tick"), (2.5, "sparkle", 0.5), (5.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def H02_vintage():
    items = [photo(VIN_F, 2.5, z=1.0, fx=["kenburns"]), photo(VIN_S, 3.0, z=1.0, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Une marquise<br><i>vintage</i>.", over="Sur mesure", size="s100"),
         "c": card("Perlage et ciselure,<br>chaque détail <i>pensé</i>.", size="s72")}
    L.update(endcard("Ton style, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.2, 5.5, 0, 12)] + end_tl(5.5, 8.0)
    au = ([(0.2, "sparkle", 0.6), (2.48, "whoosh_rev", 0.5), (2.5, "sparkle", 0.8), (5.5, "impact", 0.5)], "ambient")
    return items, L, tl, au


@reel
def H03_eternite():
    items = [photo(ETER1, 2.0, z=1.0, fx=["kenburns"]), photo(ETER2, 2.0, z=1.0, fx=["flash", "kenburns"]),
             photo(ETER1, 1.0, z=1.4, fx=["punch", "flash_out"]), end_solid(2.5)]
    L = {"h": card("L’alliance <i>éternité</i>.", over="Diamants de laboratoire", size="s86"),
         "c": card("Des pierres<br><i>tout le tour</i>.", size="s86")}
    L.update(endcard("Ton alliance, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c", 2.0, 0.15, 5.0, 0, 12)] + end_tl(5.0, 7.5)
    au = ([(0.1, "sparkle", 0.6), (1.98, "whoosh_rev"), (2.0, "impact", 0.6), (2.05, "sparkle"), (4.0, "tick"),
           (5.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def H04_message_grave():
    items = [photo(ENGR, 2.5, z=1.0, fx=["kenburns"]), photo(BOX1, 2.0, z=1.1, fx=["flash", "kenburns"]),
             photo(BOX2, 2.0, z=1.1, fx=["flash", "kenburns", "flash_out"]), end_solid(2.5)]
    L = {"h": card("Ce qu’elle verra<br>chaque fois qu’elle <i>l’enlève</i>.", size="s72"),
         "c": card("Un message, gravé<br><i>à l’intérieur</i>.", size="s86")}
    L.update(endcard("Ta bague, <i>ton histoire.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.15, 6.5, 0, 12)] + end_tl(6.5, 9.0)
    au = ([(0.2, "sparkle", 0.5), (2.48, "whoosh_rev", 0.5), (2.5, "impact", 0.5), (4.5, "sparkle", 0.6),
           (6.5, "impact", 0.5)], "ambient")
    return items, L, tl, au


@reel
def H05_coussin_baguettes():
    items = [photo(CUS_F, 2.5, z=1.35, fx=["kenburns"]), photo(CUS_S, 2.5, z=1.35, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Coussin<br>et <i>baguettes</i>.", size="s100"),
         "c": card("Un classique,<br><i>intemporel</i>.", size="s86")}
    L.update(endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.15, 5.0, 0, 12)] + end_tl(5.0, 7.5)
    au = ([(0.2, "sparkle", 0.6), (2.48, "whoosh_rev"), (2.5, "impact", 0.6), (2.55, "sparkle"), (5.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def H06_pas_que_des_bagues():
    items = [photo(HOOP_F, 2.0, z=1.2, fx=["kenburns"]), photo(HOOP_S, 1.5, z=1.2, fx=["flash", "punch"]),
             photo(ETER2, 1.5, z=1.0, fx=["flash", "punch"]), photo(PEAR, 1.5, z=1.35, fx=["flash", "punch", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Pas <i>que</i> des bagues.", size="s86"),
         "l1": label(1, "Boucles d’oreilles"), "l2": label(2, "Alliances"), "l3": label(3, "Bagues de fiançailles")}
    L.update(endcard("Ton bijou, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("l1", 2.0, 0.1, 3.5, 0, 10), ("l2", 3.5, 0.1, 5.0, 0, 10), ("l3", 5.0, 0.1, 6.5, 0, 10)] + end_tl(6.5, 9.0)
    au = ([(0.1, "sparkle", 0.5), (2.0, "impact", 0.6), (3.5, "impact", 0.6), (5.0, "impact", 0.6), (6.5, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def H07_ouverture_boite():
    items = [photo(BOX2, 2.0, z=1.0, fx=["kenburns"]), photo(BOX1, 2.5, z=1.15, fx=["flash", "kenburns", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Le moment où<br>tu ouvres la <i>boîte</i>.", size="s86"),
         "c": card("Envoie ça à quelqu’un<br>qui doit faire <i>la demande</i>.", size="s62")}
    L.update(endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c", 2.0, 0.15, 4.5, 0, 12)] + end_tl(4.5, 7.0)
    au = ([(0.2, "tick"), (1.98, "whoosh_rev"), (2.0, "impact", 0.7), (2.05, "sparkle"), (4.5, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def H08_EN_which_one():
    cells = [S(p, 0, 5.0, zoom=1.5, cx=POS[p][0], cy=POS[p][1], fx=["kenburns"]) for p in (MQ_F, CUS_F, EM_F, PEAR)]
    items = [("grid", (cells, 5.0, [])), end_solid(2.0)]
    L = {"q": card("Which one is <i>yours</i>?", size="s72", top=850),
         "n": num(1, 66, 300) + num(2, 612, 300) + num(3, 66, 1010) + num(4, 612, 1010),
         "r": card("Marquise, cushion,<br>emerald or pear?", size="s62", top=1080)}
    L.update(endcard("Your shape, <i>your ring.</i>", None, **EN_END))
    tl = [("q", 0, 0, 5.0, 0, 0), ("n", 0, 0, 5.0, 0, 0), ("r", 1.0, 0.3, 5.0, 0, 12)] + end_tl(5.0, 7.0)
    au = ([(0.0, "sparkle", 0.6), (1.0, "tick"), (2.5, "sparkle", 0.5), (5.0, "impact", 0.5)], "lux")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
