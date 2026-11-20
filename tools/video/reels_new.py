"""New footage of 20 Nov 2026 (C041 Benny turning, C056 Jobby turning, C064 four rings together, C067 a new yellow-gold
marquise with its pavé band). Masters without location data; W = locked by ringframe.py (zoom 1.4 at most).
- AD_multi_groupe: the paid ad opened on the four rings together (to A/B test against the price-first version);
- R_laquelle: organic reel, "Laquelle tu choisis ? 1, 2 ou 3" (comments), no price on a ring Rayane has not priced."""
import sys
import pro
from reels_jobby_v2 import shots
from reels_jobby_tr import choice_card
from reels_multi import RINGS, ring_card
from reels_app import app


def hook_small(top=236):
    """Compact hook for the group shot: ends above y 430, where the rings start."""
    base = '<div class="lxs"></div>' + f'<div class="lx lxo" style="top:{top}px">Beto Jewelry · Montréal</div>'
    l1 = f'<div class="lx lxh" style="top:{top + 44}px;font-size:68px">Nos dernières bagues,</div>'
    l2 = f'<div class="lx lxh" style="top:{top + 118}px;font-size:68px"><i>avec leur vrai prix.</i></div>'
    return [base + l1, base + l1 + l2]


def AD_multi_groupe():
    seq = [(("QUATRE64", 0.5), 4)]
    texts = [dict(html=hook_small(), at=0, until=4, every=1)]
    at = 4
    rings = [RINGS[0][:5] + ((("BENNY41W", 1.0), ("BENNY43W", 4.0)),),
             RINGS[1][:5] + ((("JOBBY56W", 1.0), ("JOBBY2W", 5.7)),)]
    for _, price, over, detail, spec, (front, det) in rings:
        seq += [(front, 3), (det, 3)]
        texts.append(dict(html=ring_card(price, over, detail, spec), at=at, until=at + 6, every=2))
        at += 6
    seq.append((("JOBBY3W", 20.3), 8))
    texts.append(dict(html=choice_card(.74), at=at, until=at + 8, every=1.2, min_s=7))
    return dict(name="AD_multi_groupe", music="228", shots=shots(*seq), texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


def num(n, line, top=250):
    return ['<div class="lxs" style="height:620px"></div>'
            f'<div class="lx lxp" style="top:{top}px;font-size:150px">{n}</div>'
            f'<div class="lx lxo" style="top:{top + 172}px">{line}</div>']


def R_laquelle():
    seq = [(("QUATRE64", 0.5), 4), (("BENNY41W", 2.0), 4), (("JOBBY56W", 2.0), 4), (("DUO67W", 1.0), 4),
           (("QUATRE64", 3.5), 6)]
    texts = [dict(html=['<div class="lxs" style="height:620px"></div>'
                        '<div class="lx lxh" style="top:250px;font-size:76px">Laquelle tu <i>choisis ?</i></div>'],
                  at=0, until=4),
             dict(html=num(1, "Or blanc · anneau torsadé"), at=4, until=8),
             dict(html=num(2, "Or jaune · tête florale"), at=8, until=12),
             dict(html=num(3, "Or jaune · avec son jonc pavé"), at=12, until=16),
             dict(html=['<div class="lxs" style="height:640px"></div>'
                        '<div class="lx lxh" style="top:236px;font-size:70px">Écris <i>1, 2 ou 3</i></div>'
                        '<div class="lx lxo" style="top:330px">en commentaire</div>'
                        '<div class="lx lxd" style="top:384px">Consultation gratuite · lien en bio</div>'],
                  at=16, until=22, min_s=3.5)]
    return dict(name="R_laquelle", music="432", shots=shots(*seq), texts=texts, end=dict(beats=0, overlay=True, layers={}))


REELS = {"AD_multi_groupe": AD_multi_groupe, "R_laquelle": R_laquelle,
         "R_laquelle_APP": lambda: app(R_laquelle(), 100)}

if __name__ == "__main__":
    for n in sys.argv[1:]:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
