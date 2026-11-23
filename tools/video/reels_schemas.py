"""Explainer reels built on the schema bank (schemas/schemas.py, 23 Nov 2026, Rayane: « des vidéos un peu plus
explicatives… une banque d'images… pour les vidéos futures d'explication »).

The drawings are generic illustrations (never presented as a real piece); every real ring on screen is Beto's own
footage. Facts: shape names and descriptions are standard (GIA vocabulary); the marquise ring is the 4 ct lab-grown
marquise with a hidden halo (no client name, no price here). Every caption stays on screen long enough to be read
(pacing rule: 0.7 s + 1 s per 13 characters, never under 2 s).

Usage: BETO_SCHEMAS=<dir of colourway folders> python3 reels_schemas.py [X01_formes X02_halo_cache ...]"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pro
from reels_jobby_tr import L
from reelkit import S

SCH = os.environ.get("BETO_SCHEMAS", os.path.join(os.environ.get("BETO_WORK_DIR", "/tmp/beto-video"), "schemas", "svg"))
IVORY, GOLD, GOLD_L, INK = "#F6F3EE", "#C9A86A", "#DABD86", "#0F0E0C"
FR = dict(cta="Consultation gratuite — lien en bio", place="Montréal · ou en vidéo")
REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def svg(name, cw="ivoire"):
    p = os.path.join(SCH, cw, f"{name}.svg")
    if not os.path.exists(p):
        raise SystemExit(f"missing drawing {p}: run schemas/schemas.py first")
    return p


def J(t, size=120, **kw):
    return dict(t=t, f="jost", w=800, size=size, **kw)


def BI(t, size=160, **kw):
    kw.setdefault("color", GOLD_L)
    return dict(t=t, f="bodI", w=400, size=size, upper=False, **kw)


QUATRE = S("u:QUATRE64.mp4", 0.0, 1, zoom=1.0, cx=540, cy=960, fx=["kenburns"])   # 6.9 s clip: last shot only
UNDER = [L("JOBBY1M", 0.0), L("BENNY41W", 0.0)]   # long clips under the full-screen ink background (never seen)

SHAPES = [("forme_rond", "Rond"), ("forme_ovale", "Ovale"), ("forme_coussin", "Coussin"),
          ("forme_princesse", "Princesse"), ("forme_emeraude", "Émeraude"), ("forme_asscher", "Asscher"),
          ("forme_radiant", "Radiant"), ("forme_poire", "Poire"), ("forme_marquise", "Marquise"), ("forme_coeur", "Cœur")]


# ---- X01: « 10 formes de diamant. Laquelle est la tienne ? » — each shape drawn on the beat, name only
@reel
def X01_formes():
    per = 4                                  # beats per shape (2.3 s at 103 BPM: the name is read in time)
    hook = 4
    n = len(SHAPES)
    body = hook + n * per
    half = body // 2
    shots = [dict(shot=UNDER[0], beats=half, tr="cut"), dict(shot=UNDER[1], beats=body - half, tr="fadewhite"),
             dict(shot=QUATRE, beats=6)]
    el = [dict(type="bg", at=-1, until=body, out="cut", color=INK),
          dict(type="stack", at=-0.6, until=hook, out="up", y=330, every=0.5, lines=[
              J("10 formes", 128), BI("de diamant.", 150)]),
          dict(type="schema", svg=svg("forme_rond", "or"), at=0, until=hook, out="cut", x=540, y=1080, size=640,
               draw=hook - 0.5, float=6)]
    for i, (f, name) in enumerate(SHAPES):
        a = hook + i * per
        el += [
            dict(type="kicker", at=a, until=a + per, out="cut", t=f"{i + 1:02d} / {n}", y=300, size=30, color=IVORY),
            dict(type="schema", svg=svg(f), at=a, until=a + per, out="cut", x=540, y=880, size=820, draw=2.2,
                 color=IVORY, float=5),
            dict(type="stack", at=a + 0.4, until=a + per, out="cut", y=1340, lines=[BI(name, 150, anim="pop")]),
        ]
    el.append(dict(type="flash", beats=[body], alpha=0.6, decay=10))
    return dict(name="X01_formes", music="432", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Laquelle est <i>la tienne ?</i>", **FR)))


# ---- X02: « Le halo caché » — top view = a solitaire; side view = the hidden halo lights up; then the real ring
@reel
def X02_halo_cache():
    # 80.8 BPM: 1 beat = 0.74 s
    shots = [dict(shot=UNDER[0], beats=22, tr="fadewhite"),
             dict(shot=L("JOBBY2T", 5.4), beats=7)]
    el = [
        dict(type="bg", at=-1, until=22, out="cut", color=INK),
        # 0-6: from the top, it looks like a solitaire
        dict(type="kicker", at=-0.5, until=6, out="cut", t="Vue de dessus", y=300, size=30, color=IVORY),
        dict(type="schema", svg=svg("forme_marquise", "or"), at=0, until=6, out="cut", x=540, y=900, size=700, draw=3,
             float=5),
        dict(type="text", at=1.5, until=6, out="cut", y=1330, size=78, color=IVORY, t="On dirait un solitaire."),
        # 6-14: side view, the halo hidden under the stone lights up
        dict(type="kicker", at=6, until=22, out="cut", t="Vue de côté", y=300, size=30, color=IVORY),
        dict(type="schema", svg=svg("bague_profil_hidden-halo"), at=6, until=22, out="cut", x=540, y=930, size=900,
             draw=3.5, color=IVORY, focus=[dict(steps=["halo-cache"], at=10, until=22)]),
        dict(type="stack", at=10, until=15, out="cut", y=1390, lines=[BI("Un halo caché.", 120, anim="pop")]),
        # 15-22: what it is (reading time 4.6 s for 50 characters)
        dict(type="text", at=15, until=22, out="cut", anim="words", every=0.45, y=1380, size=62, color=IVORY,
             t="Des petits diamants sous la pierre, visibles de profil."),
        dict(type="flash", beats=[22], alpha=0.55, decay=10),
        # 22-29: the real thing
        dict(type="scrim", at=22, until=29, out="cut", grad="top", h=760),
        dict(type="kicker", at=22.2, until=29, out="cut", t="En vrai", y=300, size=30, color=IVORY),
        dict(type="text", at=22.6, until=29, out="cut", y=360, size=70, color=IVORY,
             t="Marquise 4 carats<br>diamant de laboratoire"),
    ]
    return dict(name="X02_halo_cache", music="225", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=6, overlay=True, layers=pro.end_overlay("Le détail <i>qu'on voit de côté.</i>", **FR)))


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out = pro.build(REELS[n]())
        print("built", n, out)
