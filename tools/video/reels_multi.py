"""Paid ad with several real rings and their real prices (Rayane, 20 Nov 2026: « un edit de plusieurs bagues avec des
prix… ça va faire vraiment vendeur »). Only rings filmed for real, only prices given by Rayane, never another ring under
a price. Cheapest first, then the two ways to start. Add a ring = add one entry to RINGS."""
import sys
import pro
from reels_jobby_v2 import pill, shots
from reels_jobby_tr import choice_card
from reels_app import app

# name, price (Rayane), model line, detail line, two shots (front, detail)
RINGS = [
    ("Benny", "2 600 $", "Marquise 2 carats · or blanc 14k", "Griffes serties de diamants",
     (("BENNY42L", 1.0), ("BENNY43L", 4.0))),
    ("Jobby", "3 350 $", "Marquise 4 carats · or jaune 14k", "Tête florale et halo caché",
     (("JOBBY3T", 20.3), ("JOBBY2T62", 5.7))),   # 2T62: same clip, ring locked lower (RING_Y 0.62), clear of the card
]


def ring_card(price, model, detail, top=280):
    """Price and "+ taxes" on one line, so the card stays short and never covers the ring."""
    s = (f'<div class="nat" style="top:{top}px;font-size:104px"><span class="y">{price}</span>'
         f'<span style="font-size:44px"> + taxes</span></div>')
    s += f'<div class="nat" style="top:{top + 140}px;font-size:50px">{model}</div>'
    s += f'<div class="nat" style="top:{top + 208}px;font-size:42px">{detail}</div>'
    return [s]


def AD_multi(rings=RINGS):
    """Hook over a teaser shot, then each ring for 6 beats (front, then detail) under its own price card, then the
    two ways to start over the last ring."""
    seq = [(("JOBBY3L", 5.0), 3)]                     # teaser: the 4 ct stone, a different moment from its section
    texts = [dict(html=pill(["Nos dernières bagues,", "avec leur vrai prix."]), at=0, until=3)]
    at = 3
    for _, price, model, detail, (front, det) in rings:
        seq += [(front, 3), (det, 3)]
        texts.append(dict(html=ring_card(price, model, detail), at=at, until=at + 6))
        at += 6
    seq.append((rings[-1][4][0], 8))
    texts.append(dict(html=choice_card(.74), at=at, until=at + 8, every=1.2, min_s=7))
    return dict(name=f"AD_multi_{len(rings)}bagues", music="228", shots=shots(*seq), texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


REELS = {"AD_multi": AD_multi, "AD_multi_APP": lambda: app(AD_multi(), 100)}

if __name__ == "__main__":
    for n in sys.argv[1:]:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
