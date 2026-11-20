"""Benny's ring (19 Nov 2026 takes C042-C044): marquise 2 ct lab-grown diamond E VVS2 (IGI), 14k white gold, hidden halo,
twisted pave band (half eternity), a small pink stone hidden inside the band. Price shown: 2 600 $ + taxes (Rayane, 20 Nov).
No client name on screen. Pacing comes from pacing.py (every caption readable)."""
import sys
import pro
from reels_jobby_v2 import nat, pill, shots, CTA
from reels_app import app

FACE, FACE_T, SIDE, TWIST, BACK = ("BENNY42L", 1.0), ("BENNY42T", 12.5), ("BENNY43L", 4.0), ("BENNY44L", 6.0), ("BENNY44L", 11.0)
FACE2 = ("BENNY42L", 9.0)


def B1(cta=True):
    """Price in the hook, then the sheet; ends on the consultation."""
    texts = [
        dict(html=pill(["Marquise 2 carats :", "2 600 $ + taxes."]), at=0, until=2),
        dict(html=nat("Diamant de laboratoire<br>or blanc 14k"), at=2, until=6),
        dict(html=nat("Anneau torsadé,<br>serti de diamants"), at=6, until=10),
        dict(html=nat("Halo caché"), at=10, until=14),
        dict(html=nat(CTA), at=14, until=18),
    ]
    return dict(name="B1_prix_marquise_2ct", music="220",
                shots=shots((FACE, 2), (FACE_T, 4), (TWIST, 4), (SIDE, 4), (FACE2, 4)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


def B2():
    """The hidden pink stone: the detail only she knows about."""
    texts = [
        dict(html=pill(["Regarde à l'intérieur de l'anneau."]), at=0, until=2),
        dict(html=nat("Une pierre rose,<br>cachée."), at=2, until=6),
        dict(html=nat("Elle est la seule<br>à savoir qu'elle est là."), at=6, until=10),
        dict(html=nat("Marquise 2 carats<br>or blanc 14k"), at=10, until=14),
        dict(html=nat(CTA), at=14, until=18),
    ]
    return dict(name="B2_pierre_cachee", music="432",
                shots=shots((BACK, 2), (TWIST, 4), (SIDE, 4), (FACE, 4), (FACE2, 4)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


def AD_B():
    """Ad: the price in the hook, the sheet, then the two ways to start (deposit or free consultation)."""
    from reels_jobby_tr import choice_card
    texts = [
        dict(html=pill(["Marquise 2 carats :", "2 600 $ + taxes."]), at=0, until=2),
        dict(html=nat("Diamant de laboratoire<br>or blanc 14k"), at=2, until=6),
        dict(html=nat("Anneau torsadé,<br>serti de diamants"), at=6, until=10),
        dict(html=nat("Halo caché"), at=10, until=14),
        dict(html=choice_card(), at=14, until=22, every=1.2, min_s=7),
    ]
    return dict(name="AD_B_prix", music="738",
                shots=shots((FACE, 2), (FACE_T, 4), (TWIST, 4), (SIDE, 4), (FACE2, 8)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


REELS = {"B1": B1, "B2": B2, "AD_B": AD_B, "B1_APP": lambda: app(B1(), 100)}

if __name__ == "__main__":
    for n in sys.argv[1:]:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
