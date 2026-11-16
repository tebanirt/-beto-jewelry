"""Wave 20 (15 Nov 2026, daily production): the second post to pin on the profile, as a REGULAR reel.
« Qui est Rayane » : Rayane on screen first, then the facts from FAITS.md only (DEP, 500+ creations, MatrixGold 3D,
free consultation in Montréal or by video). Modern music (DONNEES.md §13), 80-100 BPM so the cards can be read.
Usage: python3 reels_wave20.py [R02_qui_est_rayane ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pro
from reelkit import S
from reels_pro4 import _avis, b

REELS = {}
CAD = "u:118b50e3-VIDEO-2026-11-01-11-01-49.mp4"   # Rayane's real MatrixGold turntable


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


@reel
def R02_qui_est_rayane():
    spec = _avis("fr")
    spec["name"] = "R02_qui_est_rayane"
    spec["music"] = "485"   # « Green Chair RnB », 95.7 BPM
    spec["shots"] = [
        dict(shot=b(1620314, 1.2, fx=["kenburns"]), beats=5, tr="cut"),
        dict(shot=b(1619438, 0.4, fx=["kenburns"]), beats=3, tr="smoothleft"),
        dict(shot=S(CAD, 6.0, 1, fit=True, fitbg="0xFFFFFF", fx=["kenburns"]), beats=4, tr="fadewhite"),
        dict(shot=b(1617419, 0.3, fx=["kenburns"]), beats=3, tr="fade"),
        dict(shot=b(1619438, 1.4, slowmo=True, fx=["kenburns"]), beats=3),
    ]
    spec["texts"] = [
        dict(html=pro.card_words("Je suis Rayane, | ton joaillier à Montréal.", over="Beto Jewelry", size="s72", top=820)[-1:],
             at=0, until=5),
        dict(html=pro.card_words("Joaillier diplômé (DEP). | Plus de 500 créations.", over="Mon parcours", size="s72", top=1000),
             at=5, until=8),
        dict(html=pro.card_words("Je dessine ta bague en 3D, | en 48 h.", over="Ta bague", size="s72"), at=8, until=12),
        dict(html=pro.card_words("Consultation gratuite, | à Montréal ou en vidéo.", over="On se rencontre", size="s72", top=1000),
             at=12, until=18),
    ]
    return spec


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
