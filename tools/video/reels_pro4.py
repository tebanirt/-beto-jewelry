"""Wave 12 (11 Nov 2026): formats chosen from the data (see DONNEES.md).
- people on screen (Rayane, hands, try-on): the best organic reels of the account;
- real Google reviews (17 reviews, 5 stars), quoted word for word, without names;
- shape vote (the most viewed format of the big engagement-ring brands);
- Christmas aimed at the person who proposes;
- end card drawn over the last shot (end_overlay), shorter.
Never a ring or a stone on the little finger (brief §10; pro.BANNED refuses that footage). Usage: python3 reels_pro4.py [T01_avis_google ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S
from reels import label, ROSE_PEAR, ROSE_PEAR2, ROSE_MQ, ROSE_MQ2, ROSE_EM
import pro

CAST = "u:dec72787-IMG_5717.mov"   # raw gold casting, held between gloved fingers
TRIO = "img:ee04a118-image.jpg"    # loose pink lab-grown diamonds in a gem jar

REELS = {}
FR = dict(cta="Consultation gratuite — lien en bio", place="Montréal · ou en vidéo")
EN = dict(cta="Free consultation — link in bio", place="Montréal · or by video")


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def b(cid, start, **kw):
    return S("b" + str(cid), start, 1, **kw)


def sh(base, **kw):
    d = dict(base); d.update(kw); clip = d.pop("clip"); start = d.pop("start")
    return S(clip, start, 1.0, **d)


def _avis(lang):
    fr = lang == "fr"
    shots = [
        dict(shot=b(1620314, 0.5, fx=["kenburns"]), beats=4, tr="cut"),
        dict(shot=b(1619751, 0.3, fx=["kenburns"]), beats=3, tr="smoothleft"),
        dict(shot=b(1626012, 1.0, fx=["kenburns", "glow"]), beats=3, tr="cut"),      # loose stones, tweezers
        dict(shot=b(1621466, 0.1, fx=["kenburns", "glow"]), beats=3, tr="fadewhite"),  # rings on the velvet tray
        dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=3, tr="fade"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    if fr:
        q = ["«&nbsp;Vous êtes vraiment | à l’écoute.&nbsp;»", "«&nbsp;C’est exactement | ce que je souhaitais.&nbsp;»",
             "«&nbsp;Au-dessus | de mes attentes.&nbsp;»", "17 avis Google. | 5 étoiles."]
        over, end = "Avis Google", pro.end_overlay("Ta bague, <i>sur mesure.</i>", **FR)
        name, music = "T01_avis_google", "476"
    else:
        q = ["“He took the time | to listen to what I wanted.”", "“Special | and stress-free.”",
             "“5 stars | isn’t enough.”", "17 Google reviews. | 5 stars."]
        over, end = "Google review", pro.end_overlay("Your ring, <i>custom made.</i>", **EN)
        name, music = "T02_EN_reviews", "664"
    texts = [
        dict(html=pro.card_words(q[0], over=over, size="s72", top=820), at=0, until=7),   # below Rayane's face
        dict(html=pro.card_words(q[1], over=over, size="s72"), at=7, until=13),
        dict(html=pro.card_words(q[2], over=over, size="s72"), at=13, until=16),
        dict(html=pro.card_words(q[3], size="s86"), at=16, until=18),
    ]
    return dict(name=name, music=music, shots=shots, texts=texts, end=dict(beats=5, overlay=True, layers=end),
                glints=[dict(at=13.5, x=540, y=900, s=0.7)])


@reel
def T01_avis_google():
    return _avis("fr")


@reel
def T02_EN_reviews():
    return _avis("en")


@reel
def J01_journee():
    shots = [
        dict(shot=b(1620314, 0.5, fx=["kenburns"]), beats=3, tr="cut"),
        dict(shot=b(1619751, 0.3, fx=["kenburns"]), beats=3, tr="smoothleft"),
        dict(shot=b(1626012, 1.0, fx=["kenburns", "glow"]), beats=3, tr="smoothleft"),
        dict(shot=b(1626602, 0.2, fx=["kenburns"]), beats=3, tr="fadewhite"),        # 3D design on the laptop
        dict(shot=S(CAST, 0.2, 1, zoom=1.8, cx=532, cy=1248, fx=["kenburns"]), beats=3, tr="smoothleft"),
        dict(shot=b(1621466, 0.1, fx=["punch", "glow"]), beats=2, tr="fade"),
        dict(shot=b(1656836, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    texts = [dict(html=pro.card_words("Une journée avec | ton joaillier.", over="Beto Jewelry · Montréal", size="s86", top=820), at=0, until=3)]
    for i, (t, a, u) in enumerate([("Consultation", 3, 6), ("Les pierres", 6, 9), ("Le design 3D", 9, 12),
                                   ("La fonte", 12, 15), ("L’écrin", 15, 19)]):
        texts.append(dict(html=[label(i + 1, t)], at=a, until=u))
    end = pro.end_overlay("Ta bague, <i>sur mesure.</i>", **FR)
    return dict(name="J01_journee", music="837", shots=shots, texts=texts, end=dict(beats=5, overlay=True, layers=end),
                glints=[dict(at=6.5, x=540, y=1000, s=0.6), dict(at=17.5, x=540, y=900, s=0.8)])


@reel
def V01_vote_forme():
    shots = [
        dict(shot=sh(ROSE_PEAR, fx=["kenburns", "glow"]), beats=4, tr="cut"),
        dict(shot=sh(ROSE_PEAR2, fx=["punch", "glow"]), beats=3, tr="hblur"),
        dict(shot=sh(ROSE_MQ, fx=["punch", "glow"]), beats=3, tr="hblur"),
        dict(shot=sh(ROSE_EM, slowmo=True, fx=["punch", "glow"]), beats=3, tr="cut"),
        dict(shot=sh(ROSE_MQ2, fx=["punch", "rgb", "glow"]), beats=1, tr="fadewhite"),
        dict(shot=S(TRIO, 0, 1, fx=["kenburns", "glow"]), beats=2),
    ]
    texts = [dict(html=pro.card_words("Poire, marquise | ou émeraude ?", over="Diamants de laboratoire roses", size="s86"), at=0, until=4)]
    for i, (t, a, u) in enumerate([("Poire", 4, 7), ("Marquise", 7, 10), ("Émeraude", 10, 13)]):
        texts.append(dict(html=[label(i + 1, t)], at=a, until=u))
    end = pro.end_overlay("Vote : <i>1, 2 ou 3 ?</i>", cta="Réponds en commentaire", place=FR["place"])
    return dict(name="V01_vote_forme", music="744", shots=shots, texts=texts, end=dict(beats=6, overlay=True, layers=end),
                glints=[dict(at=4.5, x=560, y=1080, s=0.8), dict(at=10.5, x=540, y=1100, s=0.7)])


@reel
def N02_demande_noel():
    shots = [
        dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="zoomin"),
        dict(shot=b(1621466, 0.1, fx=["punch", "glow"]), beats=3, tr="smoothleft"),
        dict(shot=b(1622069, 0.2, fx=["kenburns", "glow"]), beats=3, tr="smoothleft"),
        dict(shot=b(1656836, 0.1, fx=["kenburns", "glow"]), beats=3, tr="fadewhite"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    texts = [
        dict(html=pro.card_words("Tu fais ta demande | à Noël ?", over="Noël 2026", size="s86"), at=0, until=4),
        dict(html=pro.card_words("Design 3D en 48 h, | bague prête en 2 semaines.", size="s72"), at=4, until=10),
        dict(html=pro.card_words("Commandez avant | le 11 décembre.", size="s86"), at=10, until=15),
    ]
    end = pro.end_overlay("Commandez avant<br>le <i>11 décembre.</i>", **FR)
    return dict(name="N02_demande_noel", music="916", shots=shots, texts=texts, end=dict(beats=5, overlay=True, layers=end),
                glints=[dict(at=1, x=540, y=760, s=0.7), dict(at=13.5, x=540, y=900, s=0.8)])


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
