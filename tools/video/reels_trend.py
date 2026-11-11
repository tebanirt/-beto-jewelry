"""Wave 13 (11 Nov 2026): copies of the formats that are working right now (see DONNEES.md §8).

Two kinds of files:
- *_APP: cut on the exact tempo of a trending song, SILENT. Rayane adds the song in the Instagram app
  (Instagram does not let an API attach a song from its library, and a known song baked into the file gets muted).
- the others: same edit with a Mixkit track, published automatically as trial reels.
Slow, macro, light sweeps, glints, one line of text: the style of the jewelry reels with millions of views.
Never a ring worn on the pinky (brief §10). Usage: python3 reels_trend.py [A01_ecrin ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S
from reels import label, ROSE_PEAR, ROSE_PEAR2, ROSE_MQ, ROSE_EM, JAUNE, BLEU_PEAR, VERT_EM, ROSE_MQ2, BLEU_RD2, JAUNE_B, VERT_OV
import pro

BOX1, BOX2 = "img:44e2c708-image.jpg", "img:ef0863dd-image.jpg"
REELS = {}
FR = dict(cta="Consultation gratuite — lien en bio", place="Montréal · ou en vidéo")

# Trending audio, November 2026 (SocialPilot, Buffer, Later, CreatorDB; tempo: Tunebat / SongBPM)
ANGEL = 128.0      # « Angel Of My Dreams » — JADE (jewelers: ring box opening in slow motion, turned toward the light)
HOUSEWIFE = 133.0  # « Housewife » — Tate McRae (one look per beat drop)
MARIAH = 150.0     # « All I Want for Christmas Is You » — Mariah Carey (5.8 M reels)
WALTZ = 58.0       # « The Blue Danube Waltz » (trend « Every girl for absolutely no reason »): one cut per bar


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def b(cid, start, **kw):
    return S("b" + str(cid), start, 1, **kw)


def sh(base, **kw):
    d = dict(base); d.update(kw); clip = d.pop("clip"); start = d.pop("start")
    return S(clip, start, 1.0, **d)


def _audio(spec, music, bpm, app):
    if app:
        spec["name"] += "_APP"; spec["music"] = None; spec["bpm"] = bpm
    else:
        spec["music"] = music
    return spec


# ---- A01: box opening in slow motion, turned toward the light (copy of the « Angel Of My Dreams » jeweler trend)
def _ecrin(app):
    shots = [
        dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=6, tr="fade"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="fade"),
        dict(shot=b(1657341, 0.0, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="zoomin"),
        dict(shot=b(1656836, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="fade"),
        dict(shot=S(BOX1, 0, 1, zoom=1.1, cx=760, cy=1000, fx=["kenburns", "glow"]), beats=4),
    ]
    texts = [dict(html=pro.card_words("POV : elle ouvre | la boîte.", size="s86"), at=0, until=6)]
    spec = dict(name="A01_ecrin", shots=shots, texts=texts,
                end=dict(beats=4, overlay=True, layers=pro.end_overlay("Ta bague, <i>sur mesure.</i>", **FR)),
                glints=[dict(at=2, x=540, y=780, s=0.8), dict(at=8, x=540, y=760, s=0.7), dict(at=19, x=540, y=930, s=0.9)],
                sweeps=[dict(at=1, beats=3), dict(at=11, beats=3), dict(at=18, beats=3)])
    return _audio(spec, "1210", ANGEL, app)


@reel
def A01_ecrin():
    return _ecrin(False)


@reel
def A01_ecrin_APP():
    return _ecrin(True)


# ---- A02: slow showcase of one stone, specs on screen (copy of the 60 s single-piece showcases with millions of views)
def _vitrine(app):
    shots = [
        dict(shot=sh(ROSE_PEAR, slowmo=True, fx=["kenburns", "glow"]), beats=8, tr="fade"),
        dict(shot=sh(ROSE_PEAR2, slowmo=True, fx=["kenburns", "glow"]), beats=6, tr="fade"),
        dict(shot=sh(ROSE_EM, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="fade"),
        dict(shot=sh(ROSE_MQ, slowmo=True, fx=["kenburns", "glow"]), beats=6),   # longest source: runs under the end card
    ]
    texts = [
        dict(html=pro.card_words("Regarde-le | dans la lumière.", over="Diamant de laboratoire rose", size="s86"), at=0, until=8),
        dict(html=[label(1, "Poire")], at=8, until=14),
        dict(html=[label(2, "Émeraude")], at=14, until=18),
        dict(html=[label(3, "Marquise")], at=18, until=24),
    ]
    spec = dict(name="A02_vitrine_rose", shots=shots, texts=texts,
                end=dict(beats=4, overlay=True, layers=pro.end_overlay("Ta couleur. <i>Ta bague.</i>", **FR)),
                glints=[dict(at=3, x=560, y=1080, s=0.8), dict(at=10, x=540, y=1050, s=0.7), dict(at=16, x=540, y=1100, s=0.7)],
                sweeps=[dict(at=1.5, beats=4), dict(at=9, beats=4), dict(at=15, beats=4), dict(at=21, beats=3)])
    return _audio(spec, "599", ANGEL, app)


@reel
def A02_vitrine_rose():
    return _vitrine(False)


@reel
def A02_vitrine_rose_APP():
    return _vitrine(True)


# ---- A03: « Toutes les filles, sans aucune raison : » (trend « Every girl for absolutely no reason », Blue Danube Waltz)
@reel
def A03_toutes_les_filles_APP():
    shots = [
        dict(shot=b(1632324, 0.0, slowmo=True, fx=["kenburns", "glow"]), beats=2, tr="fade"),
        dict(shot=b(1631022, 0.2, slowmo=True, fx=["kenburns", "glow"]), beats=2, tr="fade"),
        dict(shot=b(1632578, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2, tr="fade"),
        dict(shot=b(1632718, 0.0, slowmo=True, fx=["kenburns", "glow"]), beats=2),   # ring at the ring finger
    ]
    texts = [
        dict(html=pro.card_words("Toutes les filles, | sans aucune raison :", size="s72"), at=0, until=2),
        dict(html=pro.card_words("regarder leur bague | 400 fois par jour.", size="s72"), at=2, until=8),
    ]
    spec = dict(name="A03_toutes_les_filles", shots=shots, texts=texts,
                end=dict(beats=2, overlay=True, layers=pro.end_overlay("Ta bague, <i>sur mesure.</i>", **FR)),
                glints=[dict(at=1, x=600, y=1150, s=0.8), dict(at=4, x=560, y=1100, s=0.7)],
                sweeps=[dict(at=0.5, beats=2), dict(at=3.5, beats=2)])
    return _audio(spec, None, WALTZ, True)


# ---- A04: Christmas « cadeau ou demande ? » (Mariah Carey, 5.8 M reels; approved Christmas copy)
@reel
def A04_noel_mariah_APP():
    shots = [
        dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=8, tr="zoomin"),
        dict(shot=b(1621466, 0.1, fx=["punch", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=b(1622069, 0.2, fx=["kenburns", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=b(1656836, 0.1, fx=["kenburns", "glow"]), beats=4, tr="fadewhite"),
        dict(shot=S(BOX1, 0, 1, zoom=1.1, cx=760, cy=1000, fx=["kenburns", "glow"]), beats=4),
    ]
    texts = [
        dict(html=pro.card_words("Cadeau de Noël… | ou demande ?", over="Noël 2026", size="s86"), at=0, until=8),
        dict(html=pro.card_words("Design 3D en 48 h, | bague prête en 2 semaines.", size="s72"), at=8, until=16),
        dict(html=pro.card_words("Commandez avant | le 11 décembre.", size="s86"), at=16, until=24),
    ]
    spec = dict(name="A04_noel_mariah", shots=shots, texts=texts,
                end=dict(beats=6, overlay=True, layers=pro.end_overlay("Commandez avant<br>le <i>11 décembre.</i>", **FR)),
                glints=[dict(at=2, x=540, y=780, s=0.8), dict(at=21, x=540, y=930, s=0.9)],
                sweeps=[dict(at=2, beats=4), dict(at=20, beats=4)])
    return _audio(spec, None, MARIAH, True)


# ---- A05: one colour per beat drop (« Housewife », the #1 song: « one look per beat drop »)
@reel
def A05_couleurs_housewife_APP():
    seq = [JAUNE, BLEU_PEAR, VERT_EM, ROSE_PEAR, ROSE_MQ2, BLEU_RD2, JAUNE_B, VERT_OV]
    shots = [dict(shot=sh(c, fx=["punch", "glow"]), beats=(2 if i < 4 else 1), tr=("cut" if i not in (3, 7) else "fadewhite"))
             for i, c in enumerate(seq)]
    shots.append(dict(shot=sh(ROSE_PEAR2, slowmo=True, fx=["kenburns", "glow"]), beats=6))
    texts = [dict(html=pro.card_words("Rose, jaune, bleu | ou vert ?", over="Diamants de laboratoire", size="s86"), at=0, until=8),
             dict(html=pro.card_words("La tienne.", size="s120"), at=12, until=18)]
    spec = dict(name="A05_couleurs_housewife", shots=shots, texts=texts,
                end=dict(beats=6, overlay=True, layers=pro.end_overlay("Ta couleur. <i>Ta bague.</i>", **FR)),
                glints=[dict(at=13, x=470, y=1080, s=0.9)], sweeps=[dict(at=12.5, beats=3)])
    return _audio(spec, None, HOUSEWIFE, True)


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
