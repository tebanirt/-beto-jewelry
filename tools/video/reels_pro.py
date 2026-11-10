"""Showcase pro edits (real licensed music, beat-synced). Usage: python3 reels_pro.py [P01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S
from reels import endcard, FR_END, ROSE_PEAR, ROSE_PEAR2, ROSE_MQ2, JAUNE, JAUNE_B, BLEU_PEAR, BLEU_RD2, VERT_EM, VERT_OV
import pro

# stills (photos / renders)
CAD2 = "u:ff494d11-VIDEO-2026-10-27-22-13-38.mp4"
R_PAVE, POV_PAVE = "img:5cb47fe1-image.jpg", "img:1c6e1795-image.jpg"
T_OVPAVE = "img:761f226b-image.jpg"
TRIO = "img:ee04a118-image.jpg"
BOX1, BOX2 = "img:44e2c708-image.jpg", "img:ef0863dd-image.jpg"
CUS_F, EM_F, PEAR, VIN_F = "img:14712e3f-image.jpg", "img:3b236e76-image.jpg", "img:18ea6566-image.jpg", "img:8dfe3461-image.jpg"

REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def sh(base, **kw):
    d = dict(base); d.update(kw); clip = d.pop("clip"); start = d.pop("start")
    return S(clip, start, 1.0, **d)


@reel
def P01_rendu_a_reel():
    shots = [
        dict(shot=S(CAD2, 0.0, 1, fit=True, fitbg="0xFFFFFF", fx=["kenburns"]), beats=8, tr="zoomin"),
        dict(shot=S(R_PAVE, 0, 1, fit=True, fx=["kenburns", "glow"]), beats=4, tr="fadewhite"),
        dict(shot=S(POV_PAVE, 0, 1, zoom=1.3, cx=680, cy=950, fx=["kenburns", "glow"]), beats=6, tr="smoothleft"),
        dict(shot=S(T_OVPAVE, 0, 1, zoom=1.0, fx=["kenburns", "glow"]), beats=6, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("Le rendu 3D…", over="Ovale · anneau pavé", size="s100"), at=0, until=12),
        dict(html=pro.card_words("… la vraie bague.", size="s100"), at=12, until=18),
        dict(html=pro.card_words("Et le moment | où elle la porte.", size="s86"), at=18, until=24),
    ]
    end = dict(beats=8, layers=endcard("Du rendu <i>à ta main.</i>", None, **FR_END), reveal=[0, 1, 2, 3])
    return dict(name="P01_rendu_a_reel", music="470", shots=shots, texts=texts, end=end,
                glints=[dict(at=13, x=560, y=860, s=0.9), dict(at=15, x=470, y=1000, s=0.6)])


@reel
def P02_couleurs_velocity():
    shots = [
        dict(shot=sh(VERT_EM, start=0.2, fx=["punch", "glow"]), beats=2, tr="cut"),
        dict(shot=sh(JAUNE, start=0.5, fx=["punch", "glow"]), beats=2, tr="cut"),
        dict(shot=sh(BLEU_PEAR, start=0.4, fx=["punch", "glow"]), beats=2, tr="cut"),
        dict(shot=sh(ROSE_PEAR, fx=["punch", "glow"]), beats=2, tr="hblur"),
        dict(shot=sh(ROSE_MQ2, fx=["punch", "rgb", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(BLEU_RD2, fx=["punch", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(JAUNE_B, fx=["punch", "rgb", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(VERT_OV, fx=["punch", "glow"]), beats=1, tr="fadewhite"),
        dict(shot=sh(ROSE_PEAR2, slowmo=True, fx=["kenburns", "glow"]), beats=6, tr="zoomin"),
        dict(shot=S(TRIO, 0, 1, fx=["kenburns", "glow"]), beats=4, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("4 couleurs.", size="s120"), at=0, until=8, every=2),
        dict(html=pro.card_words("1 bague.", size="s120"), at=12, until=15),
        dict(html=pro.card_words("La tienne.", size="s120"), at=15, until=22),
    ]
    end = dict(beats=8, layers=endcard("Diamants de laboratoire<br><i>de couleur.</i>", "rose · jaune · bleu · champagne · vert", **FR_END),
               reveal=[0, 1, 2, 3])
    return dict(name="P02_couleurs_velocity", music="399", shots=shots, texts=texts, end=end,
                glints=[dict(at=12, x=470, y=1080, s=0.9), dict(at=14, x=610, y=1180, s=0.6), dict(at=18, x=540, y=1000, s=0.8)])


@reel
def P03_noel():
    shots = [
        dict(shot=S(BOX2, 0, 1, zoom=1.0, fx=["kenburns", "glow"]), beats=6, tr="zoomin"),
        dict(shot=S(CUS_F, 0, 1, zoom=1.35, cx=790, cy=1000, fx=["punch", "glow"]), beats=2, tr="smoothleft"),
        dict(shot=S(EM_F, 0, 1, zoom=1.35, cx=810, cy=900, fx=["punch", "glow"]), beats=2, tr="smoothleft"),
        dict(shot=S(PEAR, 0, 1, zoom=1.35, cx=730, cy=910, fx=["punch", "glow"]), beats=2, tr="smoothleft"),
        dict(shot=S(VIN_F, 0, 1, zoom=1.05, cx=790, cy=900, fx=["punch", "glow"]), beats=2, tr="fadewhite"),
        dict(shot=S(BOX1, 0, 1, zoom=1.1, cx=760, cy=1000, fx=["kenburns", "glow"]), beats=6, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("Une bague sur mesure | sous le sapin ?", over="Noël 2026", size="s86"), at=0, until=6),
        dict(html=pro.card_words("Design 3D en 48 h, | bague prête en 2 semaines.", size="s72"), at=6, until=14),
        dict(html=pro.card_words("Commandez avant | le 11 décembre.", size="s86"), at=14, until=20),
    ]
    end = dict(beats=8, layers=endcard("Commandez avant<br>le <i>11 décembre.</i>", None, **FR_END), reveal=[0, 1, 2, 3])
    return dict(name="P03_noel", music="866", shots=shots, texts=texts, end=end,
                glints=[dict(at=2, x=540, y=930, s=0.8), dict(at=15, x=540, y=940, s=0.8)])


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
