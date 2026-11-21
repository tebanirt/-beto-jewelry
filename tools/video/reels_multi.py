"""Paid ad with several real rings and their real prices (Rayane, 20 Nov 2026: « un edit de plusieurs bagues avec des
prix… ça va faire vraiment vendeur »). Only rings filmed for real, only prices given by Rayane, never another ring under
a price. Cheapest first, then the two ways to start. Add a ring = add one entry to RINGS."""
import sys
import pro
from reels_jobby_v2 import shots
from reels_jobby_tr import choice_card
from reels_app import app

# W masters (20 Nov 2026, Rayane: « enlève les super zooms »): zoom picked by ringframe.py so the whole ring stays in
# frame, under the price card and inside the 4:5 crop, for the whole clip (Benny 1.25, Jobby 1.09 instead of 1.6 to 2.0).
# name, price (Rayane, before taxes), overline (cut and carats), the rare detail, the spec line, two shots (front, detail)
RINGS = [
    ("Benny", "2 600", "Marquise · 2 carats", "Griffes serties", "Diamants de laboratoire · or blanc 14k",
     (("BENNY42W", 1.0), ("BENNY43W", 4.0))),
    ("Jobby", "3 350", "Marquise · 4 carats", "Tête florale et halo caché", "Diamant de laboratoire · or jaune 14k",
     (("JOBBY3W", 20.3), ("JOBBY2W", 5.7))),
]

# Luxury typography (20 Nov 2026: Lauren found the TikTok Sans + yellow price "dégueulasse"; Rayane: « plus luxueux,
# plus vendeur »). Site fonts only (Bodoni Moda + Jost), ivory and champagne gold, no outline, no bubble.


def hook_card(top=300):
    base = '<div class="lxs"></div>' + f'<div class="lx lxo" style="top:{top}px">Beto Jewelry · Montréal</div>'
    l1 = f'<div class="lx lxh" style="top:{top + 52}px">Nos dernières bagues,</div>'
    l2 = f'<div class="lx lxh" style="top:{top + 141}px"><i>avec leur vrai prix.</i></div>'
    return [base + l1, base + l1 + l2]


def ring_card(price, over, detail, spec, top=240):
    """Two stages: the price first (what sells), then why (the rare detail and the spec). Ends above y 600."""
    head = ('<div class="lxs"></div>'
            f'<div class="lx lxo" style="top:{top}px">{over}</div>'
            f'<div class="lx lxp" style="top:{top + 40}px">{price}<span class="cur">$</span></div>'
            f'<div class="lx lxt" style="top:{top + 188}px">+ taxes</div>')
    why = (f'<div class="lxr" style="top:{top + 234}px"></div>'
           f'<div class="lx lxi" style="top:{top + 250}px">{detail}</div>'
           f'<div class="lx lxd" style="top:{top + 314}px">{spec}</div>')
    return [head, head + why]


def AD_multi(rings=RINGS, name=None, hook=False):
    """Each ring for 6 beats (front, then detail) under its own price card, then the two ways to start over the last
    ring. 20 Nov 2026 (conversion study): the price is on screen from the first frame (no text-only hook: 47 % of a
    video ad's value is delivered in its first 3 s); the hook sentence moves to the ad's primary text."""
    seq, texts, at = [], [], 0
    if hook:
        seq = [(("JOBBY3W", 5.0), 3)]
        texts = [dict(html=hook_card(), at=0, until=3, every=1)]
        at = 3
    for _, price, over, detail, spec, (front, det) in rings:
        seq += [(front, 3), (det, 3)]
        texts.append(dict(html=ring_card(price, over, detail, spec), at=at, until=at + 6, every=2))
        at += 6
    seq.append((rings[-1][5][0], 8))
    texts.append(dict(html=choice_card(.74), at=at, until=at + 8, every=1.2, min_s=7))
    return dict(name=name or f"AD_multi_{len(rings)}bagues", music="228", shots=shots(*seq), texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


REELS = {"AD_multi": AD_multi,
         "AD_benny_15": lambda: AD_multi([RINGS[0]], "AD_benny_15"),      # one ring: about 15 s, for cold audiences
         "AD_jobby_15": lambda: AD_multi([RINGS[1]], "AD_jobby_15"),
         "AD_multi_APP": lambda: app(AD_multi(), 100)}

if __name__ == "__main__":
    for n in sys.argv[1:]:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
