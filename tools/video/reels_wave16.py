"""Wave 16 (13 Nov 2026): volume (5-6 a day) built on what the data showed (DONNEES.md §9 and the 13 Nov review):
- lowest skip rates: Rayane on screen (66.7 %), a myth stated as a quote (69.6 %), a contrast question (70.6 %);
- product-only votes and portfolios lose 90 %+ in the first 3 s: every reel opens on a person or a bold statement;
- niche winners (TikTok, Nov 2026): « 3 things they don't tell you », POV, Christmas, « send this to him » (sends/reach).
Facts only from FAITS.md. Never a ring on the little finger (pro.BANNED). Usage: python3 reels_wave16.py [W01_erreurs ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S
from reels import ROSE_PEAR, BLEU_PEAR, JAUNE, VERT_EM
from reels_wave15 import J, BI, ring, reason, sh, b, SPOT, FR
import pro

INK = "0x0F0E0C"
CAD = "u:118b50e3-VIDEO-2026-11-01-11-01-49.mp4"
BOX1 = "img:44e2c708-image.jpg"
EN = dict(cta="Free consultation — link in bio", place="Montréal · or by video")
REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def listing(name, music, hook, items, end_title, lang="fr", hook_shot=None, hook_beats=5, hook_bg=None, extra=(), glints=()):
    """hook (stack lines) over a person/statement shot, then numbered items (shot, l1, l2, sub, beats), then the end card"""
    shots = [dict(shot=hook_shot or b(1620314, 0.5, fx=["kenburns"]), beats=hook_beats, tr="cut")]
    el = []
    if hook_bg:
        el += hook_bg
    else:
        el.append(dict(type="scrim", at=-1, until=hook_beats, out="cut", grad="top", h=1100))
    el.append(dict(type="stack", at=-0.9, until=hook_beats, out="up", y=230, every=0.3, lines=hook))
    at = hook_beats
    for i, (shot, l1, l2, sub, nb) in enumerate(items):
        shots.append(dict(shot=shot, beats=nb, tr="cut" if i < len(items) - 1 else "fadewhite"))
        el.append(dict(type="scrim", at=at, until=at + nb, out="cut", grad="top", h=1050))
        el += reason(i + 1, at, at + nb, l1, l2, sub)
        el.append(dict(type="flash", beats=[at], alpha=0.35, decay=14))
        at += nb
    shots.append(dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2))
    el += list(extra)
    cta = FR if lang == "fr" else EN
    return dict(name=name, music=music, shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay(end_title, **cta)),
                glints=list(glints) + [dict(at=at + 0.5, x=540, y=930, s=0.9)])


def cadshot():
    return S(CAD, 10.0, 1, fit=True, fitbg=INK, fitw=860, yoff=230, fx=["kenburns"])


# ---- W01 / W02: « 3 erreurs avant d'acheter ta bague » (niche format « 3 things they don't tell you »), Rayane first
@reel
def W01_erreurs():
    return listing("W01_erreurs", "470",
                   [J("3 erreurs", 140), J("avant d’acheter", 92, style="outline", stroke=4), BI("ta bague.", 150, anim="pop")],
                   [(b(1626012, 1.0, fx=["kenburns", "glow"]), "Pas de", "certificat.", "Chez nous : certificat IGI dès 1 carat", 4),
                    (cadshot(), "Ne pas la voir", "avant.", "Design 3D en 48 h, révisions incluses", 4),
                    (b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), "Deviner", "sa taille.", "Une mise à grandeur offerte après la réception", 4)],
                   "Ta bague, <i>sans erreur.</i>")


@reel
def W02_EN_mistakes():
    return listing("W02_EN_mistakes", "470",
                   [J("3 mistakes", 140), J("before buying", 92, style="outline", stroke=4), BI("her ring.", 150, anim="pop")],
                   [(b(1626012, 1.0, fx=["kenburns", "glow"]), "No", "certificate.", "With us: IGI certificate from 1 carat", 4),
                    (cadshot(), "Not seeing it", "first.", "3D design in 48 h, revisions included", 4),
                    (b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), "Guessing", "her size.", "One free resize after delivery", 4)],
                   "Your ring, <i>done right.</i>", lang="en")


# ---- W05 / W06: myth (best skip rate of the account: a myth stated as a quote)
@reel
def W05_labo_verite():
    return listing("W05_labo_verite", "744",
                   [J("Ce que personne", 100), J("ne te dit pas", 100, style="outline", stroke=4), BI("sur le diamant de labo.", 84, anim="pop")],
                   [(sh(BLEU_PEAR, slowmo=True, fx=["kenburns", "glow"]), "Carbone", "pur.", "Essentiellement les mêmes propriétés que le naturel (GIA)", 4),
                    (b(1626012, 1.0, fx=["kenburns", "glow"]), "Dureté", "10.", "Comme le diamant naturel", 4),
                    (sh(JAUNE, slowmo=True, fx=["kenburns", "glow"]), "Il existe", "en couleur.", "Rose, jaune, bleu, champagne, vert", 4)],
                   "Ta pierre. <i>Ta bague.</i>",
                   hook_shot=sh(ROSE_PEAR, slowmo=True, fx=["kenburns", "glow"]))


@reel
def W06_EN_lab_truth():
    return listing("W06_EN_lab_truth", "744",
                   [J("“Lab diamonds", 104), J("are fake.”", 130, style="outline", stroke=5), BI("Here’s the truth.", 110, anim="pop")],
                   [(sh(BLEU_PEAR, slowmo=True, fx=["kenburns", "glow"]), "Pure", "carbon.", "Essentially the same properties as natural (GIA)", 4),
                    (b(1626012, 1.0, fx=["kenburns", "glow"]), "Hardness", "10.", "Just like a natural diamond", 4),
                    (sh(JAUNE, slowmo=True, fx=["kenburns", "glow"]), "Comes in", "colour.", "Pink, yellow, blue, champagne, green", 4)],
                   "Your stone. <i>Your ring.</i>", lang="en",
                   hook_shot=sh(ROSE_PEAR, slowmo=True, fx=["kenburns", "glow"]))


# ---- W03: Christmas countdown (posted 13-14 Nov: 4 weeks before 11 Dec)
@reel
def W03_noel_4semaines():
    shots = [dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=6, tr="cut"),
             dict(shot=b(1621466, 0.1, fx=["punch", "glow"]), beats=4, tr="cut"),
             dict(shot=S(BOX1, 0, 1, zoom=1.1, cx=760, cy=1000, fx=["kenburns", "glow"]), beats=4, tr="fadewhite"),
             dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2)]
    el = [dict(type="snow", at=-1, until=16, out="cut", n=70, alpha=0.8),
          dict(type="scrim", at=-1, until=14, out="cut", grad="top", h=1100),
          dict(type="kicker", at=-1, until=6, out="up", t="Noël 2026", y=230, size=32, color="#F6F3EE"),
          dict(type="stack", at=-0.9, until=6, out="up", y=290, every=0.3, lines=[
              J("Il reste", 110), BI("4 semaines", 190, anim="pop"), J("pour sa bague.", 96, style="outline", stroke=4)]),
          dict(type="flash", beats=[6, 10], alpha=0.35, decay=14),
          dict(type="text", at=6.2, until=10, out="cut", anim="words", every=0.3, y=280, size=86, color="#F6F3EE",
               t="Design 3D en 48 h, bague prête en 2 semaines."),
          dict(type="kicker", at=10, until=14, out="cut", t="Commandez avant le", y=270, size=32, color="#F6F3EE"),
          dict(type="stack", at=10.2, until=14, out="cut", y=330, every=0.5, lines=[BI("11", 320, anim="pop"), J("décembre", 120, anim="track")])]
    return dict(name="W03_noel_4semaines", music="1005", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Commandez avant<br>le <i>11 décembre.</i>", **FR)),
                glints=[dict(at=1.5, x=540, y=780, s=0.8), dict(at=16.5, x=540, y=930, s=0.9)])


# ---- W04: POV — your jeweler shows you your ring in 3D (Rayane first, then the real CAD and his renders)
@reel
def W04_pov_3d():
    shots = [dict(shot=b(1619438, 0.2, fx=["kenburns"]), beats=4, tr="cut"),
             dict(shot=cadshot(), beats=6, tr="cut"),
             dict(shot=b(1621466, 0.1), beats=4, tr="fadewhite"),        # under the motion background
             dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2)]
    el = [dict(type="scrim", at=-1, until=4, out="cut", grad="top", h=1100),
          dict(type="kicker", at=-1, until=4, out="up", t="POV", y=230, size=40, color="#F6F3EE"),
          dict(type="stack", at=-0.9, until=4, out="up", y=300, every=0.3, lines=[
              J("Ton joaillier", 110), J("te montre ta bague", 84, style="outline", stroke=4), BI("en 3D.", 170, anim="pop")]),
          dict(type="flash", beats=[4, 10], alpha=0.35, decay=14),
          dict(type="brackets", at=4, until=10, out="cut", x=110, y=780, w=860, h=827, label="Design 3D"),
          dict(type="text", at=4.3, until=10, out="cut", anim="words", every=0.3, y=300, size=90, color="#F6F3EE",
               t="Prêt en 48 h. Révisions incluses."),
          dict(type="bg", at=10, until=14, out="cut", css=SPOT),
          ring("2330f1a8", 10, 12, y=760, w=640, anim="slam", reflect=True),
          ring("f19cfa84", 12, 14, y=760, w=640, anim="slam", reflect=True),
          dict(type="text", at=10.2, until=14, out="cut", y=300, size=86, color="#F6F3EE", t="Tu l’ajustes avant qu’elle existe.")]
    return dict(name="W04_pov_3d", music="288", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Ta bague, <i>en 3D d’abord.</i>", **FR)),
                glints=[dict(at=11, x=540, y=950, s=0.8), dict(at=14.5, x=540, y=930, s=0.9)])


# ---- W07: « Les filles, envoyez ça à votre chum » (sends per reach is the #1 signal for non-followers)
@reel
def W07_envoie_lui():
    shots = [dict(shot=S("mk51648", 5.4, 1, cx=2050, fx=["kenburns", "bwc"]), beats=5, tr="fadewhite"),
             dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="cut"),
             dict(shot=b(1621466, 0.1), beats=4, tr="fadewhite"),        # under the motion background
             dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2)]
    el = [dict(type="scrim", at=-1, until=5, out="cut", grad="top", h=1000),
          dict(type="kicker", at=-1, until=5, out="up", t="Les filles,", y=230, size=40, color="#F6F3EE"),
          dict(type="stack", at=-0.9, until=5, out="up", y=300, every=0.3, lines=[
              J("envoyez ça", 120), J("à votre chum.", 120, style="outline", stroke=4), BI("Il va comprendre.", 110, anim="pop")]),
          dict(type="flash", beats=[5, 9], alpha=0.45, decay=12),
          dict(type="scrim", at=5, until=9, out="cut", grad="top", h=1050),
          *reason(1, 5, 9, "Sa bague,", "sur mesure.", "Design 3D en 48 h, révisions incluses"),
          dict(type="bg", at=9, until=13, out="cut", css=SPOT),
          ring("f19cfa84", 9, 13, y=820, w=600, anim="scale", float=8, reflect=True, glow=True),
          *reason(2, 9, 13, "Prête pour", "Noël.", "Commandez avant le 11 décembre")]
    return dict(name="W07_envoie_lui", music="476", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Envoie-lui <i>ça.</i>", **FR)),
                glints=[dict(at=6, x=540, y=780, s=0.8), dict(at=13.5, x=540, y=930, s=0.9)])


# ---- W08: « Regarde sous la pierre » — hidden halo (render cut-out, giant type behind)
@reel
def W08_sous_la_pierre():
    shots = [dict(shot=b(1621466, 0.1), beats=8, tr="cut"),           # under the motion background
             dict(shot=cadshot(), beats=4, tr="fadewhite"),
             dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2)]
    el = [dict(type="bg", at=-1, until=8, out="cut", css=SPOT),
          dict(type="marquee", at=-1, until=8, out="cut", t="HALO CACHÉ", sep="  ·  ", y=1000, size=210, f="jost", w=900, speed=130, dir=1, alpha=0.85),
          ring("14677909", -1, 8, y=760, w=560, anim="fade", float=8, reflect=True, glow=True, zoom=[1.0, 1.12]),
          dict(type="stack", at=-0.9, until=4, out="up", y=230, every=0.3, lines=[J("Regarde", 140), J("sous la pierre.", 110, style="outline", stroke=4)]),
          dict(type="circle", at=2, until=4, out="cut", cx=540, cy=900, rx=200, ry=120),
          dict(type="text", at=4, until=8, out="cut", anim="words", every=0.3, y=250, size=80, color="#F6F3EE",
               t="Un halo caché : de petits diamants, juste sous la pierre."),
          dict(type="flash", beats=[8], alpha=0.35, decay=14),
          dict(type="text", at=8.2, until=12, out="cut", anim="words", every=0.3, y=300, size=86, color="#F6F3EE",
               t="Ton détail à toi, dessiné en 3D en 48 h.")]
    return dict(name="W08_sous_la_pierre", music="599", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Ton détail. <i>Ta bague.</i>", **FR)),
                glints=[dict(at=2.5, x=540, y=820, s=0.8), dict(at=12.5, x=540, y=930, s=0.9)])


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
