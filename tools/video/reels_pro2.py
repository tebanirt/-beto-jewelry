"""Wave 11 (P08, P09, P12 were dropped: rings worn on the pinky; remakes in reels_pro3.py): the best concepts of waves 1-9 remade with the pro engine (real Mixkit music, cuts on the beat).
Usage: python3 reels_pro2.py [P04_blanc_ou_rose ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S
from reels import (card, label, endcard, FR_END, EN_END, SRC_GIA, ROSE_OVAL, ROSE_PEAR, ROSE_MQ, ROSE_MQ2, ROSE_EM,
                   ROSE_EM2, JAUNE, BLEU_PEAR, BLEU_RD, VERT_EM, VERT_OV)
import pro

# stills and clips (same files and crops as the original waves)
from reels_c import IMG1, CAD, CAST, BANDS
from reels_h import BOX1, BOX2   # rings in their box (never a ring worn on the pinky: brief §10)

REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def sh(base, **kw):
    d = dict(base); d.update(kw); clip = d.pop("clip"); start = d.pop("start")
    return S(clip, start, 1.0, **d)


def b(cid, start, **kw):
    return S("b" + str(cid), start, 1, **kw)


def cast(t, cx, cy, z=1.8, **kw):
    return S(CAST, t, 1, zoom=z, cx=cx, cy=cy, **kw)


@reel
def P04_blanc_ou_rose():
    shots = [
        dict(shot=sh(ROSE_OVAL, slowmo=True, fx=["kenburns", "glow"]), beats=6, tr="fadewhite"),
        dict(shot=sh(ROSE_PEAR, fx=["kenburns", "glow"]), beats=6, tr="hblur"),
        dict(shot=sh(JAUNE, start=1.85, fx=["punch", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(BLEU_PEAR, start=1.65, fx=["punch", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(VERT_EM, fx=["punch", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(ROSE_MQ2, fx=["punch", "rgb", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(BLEU_RD, fx=["punch", "glow"]), beats=1, tr="cut"),
        dict(shot=sh(VERT_OV, fx=["punch", "glow"]), beats=1, tr="zoomin"),
        dict(shot=sh(ROSE_EM2, fx=["kenburns", "glow"]), beats=4, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("Tout le monde choisit | le <i>blanc</i>…", over="Beto Jewelry · Montréal", size="s86"), at=0, until=6),
        dict(html=pro.card_words("…&nbsp;et si tu osais | le <i>rose</i> ?", size="s86"), at=6, until=12),
    ]
    end = dict(beats=8, layers=endcard("Ta couleur. <i>Ta bague.</i>", "Diamants de laboratoire<br>rose · jaune · bleu · champagne · vert", **FR_END))
    return dict(name="P04_blanc_ou_rose", music="445", shots=shots, texts=texts, end=end,
                glints=[dict(at=6, x=560, y=1050, s=0.9), dict(at=13, x=540, y=1000, s=0.6)])


@reel
def P05_couleur_science():
    shots = [
        dict(shot=sh(ROSE_PEAR, fx=["kenburns", "glow"]), beats=3, tr="smoothleft"),
        dict(shot=sh(JAUNE, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=sh(BLEU_PEAR, fx=["kenburns", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=sh(ROSE_MQ, fx=["kenburns", "glow"]), beats=2, tr="fade"),
        dict(shot=sh(VERT_OV, fx=["kenburns", "glow"]), beats=2, tr="smoothleft"),
        dict(shot=sh(ROSE_EM, slowmo=True, fx=["kenburns", "glow"]), beats=3, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("D’où vient la <i>couleur</i> | d’un diamant ?", over="Diamants de couleur", size="s86"), at=0, until=3),
        dict(html=[card("De l’<i>azote</i>.", over="Jaune", det="Des atomes d’azote dans le cristal<br>absorbent la lumière bleue.", src=SRC_GIA)], at=3, until=7),
        dict(html=[card("Du <i>bore</i>.", over="Bleu", det="Moins d’un atome de bore<br>par million d’atomes de carbone.", src=SRC_GIA)], at=7, until=11),
        dict(html=[card("Un traitement<br><i>après</i> la croissance.", over="Rose et vert · en laboratoire", det="Habituellement une irradiation,<br>puis un chauffage.", src=SRC_GIA, size="s72")], at=11, until=15),
        dict(html=[card("Un <i>vrai</i> diamant.", over="Diamant de laboratoire", det="Carbone pur, dureté 10.<br>Essentiellement les mêmes propriétés<br>que le naturel.", src=SRC_GIA)], at=15, until=18),
    ]
    end = dict(beats=6, layers=endcard("Choisis ta <i>couleur.</i>", "Envoie ça à quelqu’un<br>qui prépare la grande demande.", **FR_END))
    return dict(name="P05_couleur_science", music="480", shots=shots, texts=texts, end=end,
                glints=[dict(at=3, x=540, y=1150, s=0.7), dict(at=7, x=540, y=1100, s=0.7), dict(at=15, x=540, y=1150, s=0.7)])


@reel
def P06_etapes():
    shots = [
        dict(shot=b(1617419, 0.2, fx=["kenburns"]), beats=4, tr="smoothleft"),
        dict(shot=b(1619438, 0.2, fx=["punch"]), beats=3, tr="cut"),
        dict(shot=b(1618811, 0.3, fx=["kenburns"]), beats=3, tr="zoomin"),
        dict(shot=b(1626602, 0.2, fx=["kenburns"]), beats=4, tr="cut"),
        dict(shot=b(1627599, 0.1, fx=["punch"]), beats=2, tr="fadewhite"),
        dict(shot=b(1632578, 0.1, fx=["kenburns", "glow"]), beats=3, tr="cut"),
        dict(shot=b(1632222, 0.0, fx=["punch", "glow"]), beats=2, tr="cut"),
        dict(shot=b(1630385, 0.0, fx=["glow"]), beats=2, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("Ta bague de fiançailles, | étape par <i>étape</i>.", over="Beto Jewelry · Montréal", size="s72"), at=0, until=4),
        dict(html=[card("On choisit ta <i>pierre</i>.", over="01 — Consultation gratuite", det="En personne à Montréal ou en vidéo")], at=4, until=10),
        dict(html=[card("On dessine ta <i>bague</i>.", over="02 — Design 3D en 48 h", det="Révisions incluses")], at=10, until=16),
        dict(html=[card("Elle est <i>à toi</i>.", over="03 — Prête en 2 semaines")], at=16, until=23),
    ]
    end = dict(beats=8, layers=endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    return dict(name="P06_etapes", music="1001", shots=shots, texts=texts, end=end)


@reel
def P07_ouverture_boite():
    shots = [
        dict(shot=S(BOX2, 0, 1, zoom=1.0, fx=["kenburns", "glow"]), beats=4, tr="fadewhite"),
        dict(shot=S(BOX1, 0, 1, zoom=1.1, cx=760, cy=1000, fx=["kenburns", "glow"]), beats=6, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("Le moment où | tu ouvres la <i>boîte</i>.", size="s86"), at=0, until=4),
        dict(html=pro.card_words("Envoie ça à quelqu’un | qui doit faire <i>la</i> <i>demande</i>.", size="s62"), at=4, until=10),
    ]
    end = dict(beats=6, layers=endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    return dict(name="P07_ouverture_boite", music="659", shots=shots, texts=texts, end=end,
                glints=[dict(at=1, x=540, y=930, s=0.7), dict(at=4.5, x=540, y=940, s=1.0), dict(at=7, x=600, y=980, s=0.6)])


@reel
def P10_rendu_a_or():
    shots = [
        dict(shot=S(IMG1, 0, 1, fit=True, fitbg="0xFFFFFF", fx=["kenburns", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=S(CAD, 9.7, 1, fit=True, fitbg="0xFFFFFF", fx=["kenburns"]), beats=5, tr="fadewhite"),
        dict(shot=cast(0.2, 532, 1248, fx=["kenburns"]), beats=5, tr="cut"),
        dict(shot=cast(11.6, 440, 1260, fx=["punch"]), beats=2, tr="cut"),
        dict(shot=S(BANDS, 12.0, 1, zoom=1.7, cx=400, cy=1200, fx=["punch"]), beats=2, tr="cut"),
        dict(shot=cast(15.2, 480, 1220, fx=["punch"]), beats=2, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("Ta bague existe | avant d’<i>exister</i>.", over="Design 3D en 48 h", size="s86"), at=0, until=4),
        dict(html=[card("On la dessine en <i>3D</i>.", over="01 — Le design", det="Révisions incluses")], at=4, until=9),
        dict(html=[card("Puis elle prend vie<br>en <i>or</i>.", over="02 — La fonte")], at=9, until=14),
        dict(html=[card("Prochaine étape :<br>les <i>pierres</i>.", over="03 — Le sertissage")], at=14, until=20),
    ]
    end = dict(beats=8, layers=endcard("De l’idée <i>à l’or.</i>", None, **FR_END))
    return dict(name="P10_rendu_a_or", music="134", shots=shots, texts=texts, end=end)


@reel
def P11_mythe_labo():
    shots = [
        dict(shot=sh(BLEU_PEAR, fx=["kenburns", "glow"]), beats=6, tr="fadewhite"),
        dict(shot=sh(JAUNE, fx=["punch", "glow"]), beats=4, tr="cut"),
        dict(shot=sh(ROSE_PEAR, start=1.55, fx=["punch", "glow"]), beats=3, tr="cut"),
        dict(shot=sh(VERT_EM, fx=["punch", "glow"]), beats=3, tr="hblur"),
        dict(shot=sh(ROSE_MQ2, fx=["kenburns", "glow"]), beats=4, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("«&nbsp;Un diamant de labo, | c’est du <i>faux</i>.&nbsp;»", over="Mythe ou réalité ?", size="s86"), at=0, until=6),
        dict(html=[card("<i>Faux.</i>", size="s120", det="Carbone pur. Dureté 10.<br>Essentiellement les mêmes propriétés<br>que le naturel.", src=SRC_GIA)], at=6, until=13),
        dict(html=pro.card_words("Et oui, il existe | en <i>couleur</i>.", over="Diamant de laboratoire", size="s86"), at=13, until=20),
    ]
    end = dict(beats=8, layers=endcard("Un vrai diamant.<br><i>Ta couleur.</i>", None, **FR_END))
    return dict(name="P11_mythe_labo", music="305", shots=shots, texts=texts, end=end,
                glints=[dict(at=6, x=540, y=1150, s=0.9)])


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
