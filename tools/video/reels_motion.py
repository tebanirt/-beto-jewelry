"""Wave 14 (12 Nov 2026): motion design, like the edit Rayane sent (kinetic giant type, black & white with colour pop,
framed pictures in a matte, fast cuts on the beat) — in the Beto palette (ink, ivory, gold; Bodoni Moda + Jost).

Footage rules:
- Mixkit stock ('mk<id>', free licence) only for PEOPLE and EMOTION (proposals, weddings, winter city), always in
  black & white. Never a stock ring close-up: every ring or stone on screen is Beto's own footage, in colour.
- Never say or suggest that stock people are Beto clients. No Montréal claim on stock (none of it is Montréal).
- Never a ring or a stone on the little finger (pro.BANNED).
Usage: python3 reels_motion.py [M01_oui ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S
from reels import ROSE_PEAR, BLEU_PEAR, JAUNE, VERT_EM
import pro

INK = "0x0F0E0C"
CAST = "u:dec72787-IMG_5717.mov"   # raw gold casting, held between gloved fingers
CAD = "u:118b50e3-VIDEO-2026-11-01-11-01-49.mp4"   # Rayane's MatrixGold turntable (574x552, white background)
FR = dict(cta="Consultation gratuite — lien en bio", place="Montréal · ou en vidéo")
REELS = {}
FRAME = dict(x=60, y=700, w=960, h=540)   # 16:9 stock framed in the matte (fit, fitw=960, yoff=10)


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def b(cid, start, **kw):
    return S("b" + str(cid), start, 1, **kw)


def framed(clip, start, **kw):
    fx = kw.pop("fx", ["kenburns", "bwc"])
    return S(clip, start, 1, fit=True, fitbg=INK, fitw=FRAME["w"], yoff=10, fx=fx, **kw)


def J(t, size=150, **kw):    # Jost Black line
    return dict(t=t, f="jost", w=900, size=size, **kw)


def BI(t, size=200, **kw):   # Bodoni italic line (gold by default)
    kw.setdefault("color", "#DABD86")
    return dict(t=t, f="bodI", w=400, size=size, upper=False, **kw)


# ---- M01: « Elle va dire oui ? » — the proposal in black & white, then our rings in colour
@reel
def M01_oui():
    shots = [
        dict(shot=framed("mk51645", 2.6, fx=["kenburns", "bw"]), beats=6, tr="cut"),
        dict(shot=S("mk51648", 5.4, 1, cx=2050, fx=["kenburns", "bwc"]), beats=4, tr="fadewhite"),
        dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="cut"),
        dict(shot=S(CAD, 10.0, 1, fit=True, fitbg=INK, fitw=760, yoff=126, fx=["punch"]), beats=4, tr="cut"),
        dict(shot=S(CAST, 0.2, 1, zoom=1.8, cx=532, cy=1248, fx=["punch"]), beats=4, tr="fadewhite"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    F = FRAME
    el = [
        dict(type="stack", at=-0.8, until=6, out="up", y=262, every=0.4, lines=[
            J("Elle va", 150), J("dire", 150, style="outline", stroke=4)]),
        dict(type="stack", at=1.6, until=6, out="up", y=1262, lines=[BI("oui ?", 230, anim="pop")]),
        dict(type="brackets", at=-1, until=6, out="cut", label="La demande", **F),
        dict(type="flash", beats=[6], alpha=0.55),
        dict(type="marquee", at=6, until=10, out="cut", t="OUI", sep="  ·  ", y=250, size=290, f="jost", w=900, speed=420, dir=1),
        dict(type="marquee", at=6, until=10, out="cut", t="OUI", sep="  ·  ", y=1180, size=290, f="jost", w=900, speed=420, dir=-1),
        dict(type="flash", beats=[10], alpha=0.9, decay=10),
        dict(type="scrim", at=10, until=22, out="cut", grad="top", h=820),
        dict(type="stack", at=10.2, until=14, out="cut", y=300, every=0.8, lines=[
            J("La bague,", 130, style="outline", stroke=4), BI("on la crée ensemble.", 84, color="#F6F3EE", anim="rise")]),
        dict(type="brackets", at=14, until=18, out="cut", x=160, y=720, w=760, h=731),
        dict(type="kicker", at=14, until=18, out="cut", t="Design 3D", y=300, size=34),
        dict(type="counter", at=14.2, until=18, out="cut", from_=0, to=48, count=2, suffix='<span style="font-size:.42em"> h</span>', y=360, size=340),
        dict(type="scrim", at=18, until=22, out="cut", alpha=0.42),
        dict(type="kicker", at=18, until=22, out="cut", t="Bague prête en", y=300, size=34, color="#F6F3EE"),
        dict(type="stack", at=18.4, until=22, out="cut", y=360, every=0.6, lines=[
            BI("2", 300, anim="pop"), J("semaines", 120, anim="track")]),
    ]
    for e in el:  # 'from' is a Python keyword
        if "from_" in e: e["from"] = e.pop("from_")
    return dict(name="M01_oui", music="1001", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Elle va dire <i>oui.</i>", **FR)),
                glints=[dict(at=11, x=540, y=780, s=0.8), dict(at=22.5, x=540, y=930, s=0.9)])


# ---- M02: Christmas proposal — winter + proposals in black & white with snowfall, then our rings in colour.
#      Copy = the approved Christmas ad text (brief §6), split on screen, word for word.
@reel
def M02_noel():
    shots = [
        dict(shot=framed("mk34702", 1.0, fx=["kenburns", "bw"]), beats=4, tr="cut"),
        dict(shot=framed("mk46923", 3.2, fx=["kenburns", "bwc"]), beats=4, tr="cut"),
        dict(shot=framed("mk5780", 5.0, fx=["kenburns", "bwc"]), beats=3, tr="fadewhite"),
        dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=b(1621466, 0.1, fx=["punch", "glow"]), beats=3, tr="fadewhite"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    F = FRAME
    el = [
        dict(type="snow", at=-1, until=11, out="cut", n=80),
        dict(type="stack", at=-0.8, until=11, out="up", y=262, every=0.4, lines=[
            J("Tu fais ta", 135), J("demande", 150, style="outline", stroke=4)]),
        dict(type="stack", at=1.2, until=11, out="up", y=1262, lines=[BI("à Noël ?", 220, anim="pop")]),
        dict(type="brackets", at=-1, until=11, out="cut", label="Noël 2026", **F),
        dict(type="flash", beats=[11], alpha=0.9, decay=10),
        dict(type="scrim", at=11, until=18, out="cut", grad="top", h=900),
        dict(type="kicker", at=11, until=15, out="cut", t="Une bague sur mesure", y=290, size=30, color="#F6F3EE"),
        dict(type="text", at=11.4, until=15, out="cut", anim="words", every=0.35, y=360, size=92, color="#F6F3EE",
             t="Design 3D en 48 h, bague prête en 2 semaines."),
        dict(type="kicker", at=15, until=18, out="cut", t="Commandez avant le", y=290, size=32, color="#F6F3EE"),
        dict(type="stack", at=15.2, until=18, out="cut", y=350, every=0.5, lines=[
            BI("11", 330, anim="pop"), J("décembre", 120, anim="track")]),
    ]
    return dict(name="M02_noel", music="981", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Commandez avant<br>le <i>11 décembre.</i>", **FR)),
                glints=[dict(at=12, x=540, y=780, s=0.8), dict(at=19, x=540, y=930, s=0.9)])


def sh(base, **kw):
    d = dict(base); d.update(kw); clip = d.pop("clip"); start = d.pop("start")
    return S(clip, start, 1.0, **d)


BOX = (60, 250, 960, 760, INK)   # footage window above the step panel


# ---- E02: explainer « Ta bague en 4 étapes » — our own footage in a window, animated step panel
@reel
def E02_etapes():
    win = lambda cid, st, **kw: S("b" + str(cid), st, 1, box=BOX, fx=kw.pop("fx", ["kenburns"]), **kw)
    shots = [
        dict(shot=b(1621466, 0.1, fx=["kenburns", "glow"]), beats=4, tr="fadewhite"),
        dict(shot=win(1620314, 0.5), beats=5, tr="smoothleft"),
        dict(shot=S(CAD, 10.0, 1, box=BOX, fx=["kenburns"]), beats=5, tr="smoothleft"),
        dict(shot=S(CAST, 0.2, 1, zoom=1.5, cx=532, cy=1248, box=BOX, fx=["kenburns"]), beats=5, tr="smoothleft"),
        dict(shot=win(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=5, tr="fadewhite"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    steps = [dict(n=1, title="Consultation gratuite", sub="1 h · en personne ou en vidéo", at=4.4),
             dict(n=2, title="Design 3D en 48 h", sub="Révisions incluses", at=9),
             dict(n=3, title="Fabrication", sub="Bague prête en 2 semaines après l’approbation", at=14),
             dict(n=4, title="La remise", sub="Certificat d’authenticité inclus", at=19)]
    el = [
        dict(type="scrim", at=-1, until=4, out="cut", alpha=0.35),
        dict(type="kicker", at=-1, until=4, out="up", t="Comment ça marche ?", y=520, size=30),
        dict(type="stack", at=-0.8, until=4, out="up", y=600, every=0.5, lines=[
            J("Ta bague", 170), BI("en 4 étapes.", 150, anim="pop")]),
        dict(type="brackets", at=4, until=24, out="cut", label="Beto Jewelry · Montréal", x=60, y=250, w=960, h=760),
        dict(type="steps", at=4, until=24, out="cut", x=100, y=1100, w=920, gap=104, tsize=42, ssize=29, items=steps),
        dict(type="flash", beats=[4, 24], alpha=0.5),
    ]
    return dict(name="E02_etapes", music="623", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Ta bague, <i>sur mesure.</i>", **FR)),
                glints=[dict(at=20, x=540, y=560, s=0.7), dict(at=25, x=540, y=930, s=0.9)])


# ---- E01: explainer « C'est un vrai diamant ? » — lab-grown diamonds, facts from FAITS.md (GIA)
@reel
def E01_labo():
    shots = [
        dict(shot=sh(ROSE_PEAR, slowmo=True, fx=["kenburns", "glow"]), beats=5, tr="fadewhite"),
        dict(shot=b(1626012, 1.0, fx=["kenburns"]), beats=6, tr="smoothleft"),
        dict(shot=sh(BLEU_PEAR, slowmo=True, fx=["kenburns", "glow"]), beats=8, tr="fadewhite"),
        dict(shot=sh(JAUNE, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="fade"),
        dict(shot=sh(VERT_EM, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    el = [
        dict(type="scrim", at=-1, until=5, out="cut", grad="top", h=900),
        dict(type="kicker", at=-1, until=5, out="up", t="Diamant de laboratoire", y=250, size=28),
        dict(type="stack", at=-0.8, until=5, out="up", y=320, every=0.3, lines=[
            J("C’est un", 130), J("vrai", 200, style="outline", stroke=5), BI("diamant ?", 170, anim="pop")]),
        dict(type="scrim", at=5, until=11, out="cut", alpha=0.8),
        dict(type="kicker", at=5, until=11, out="cut", t="Le cristal du diamant", y=300, size=30),
        dict(type="lattice", at=5, until=11, out="cut", cx=540, cy=840, size=560, draw=4, spin=0.45, cells=2),
        dict(type="stack", at=7, until=11, out="cut", y=1290, every=1.5, lines=[
            BI("Du carbone pur.", 96, color="#F6F3EE", anim="rise"), BI("Dureté : 10.", 96, anim="rise")]),
        dict(type="scrim", at=11, until=19, out="cut", alpha=0.55),
        dict(type="kicker", at=11, until=19, out="cut", t="Naturel ou laboratoire ?", y=300, size=30, color="#F6F3EE"),
        dict(type="compare", at=11, until=19, out="cut", x=70, y=420, w=940, rh=108,
             rows=[dict(label="Carbone pur", at=12), dict(label="Dureté 10", at=13), dict(label="Mêmes propriétés*", at=14)],
             foot=dict(t="La différence : l’origine.", at=15.5), src="* Essentiellement les mêmes · Source : GIA"),
        dict(type="flash", beats=[19], alpha=0.6),
        dict(type="stamp", at=19.2, until=23, out="cut", cx=540, cy=600, r=190, ring="CERTIFICAT IGI · DÈS 1 CARAT · CERTIFICAT IGI · DÈS 1 CARAT · ", center="IGI"),
        dict(type="stack", at=20, until=23, out="cut", y=1300, lines=[BI("Certifié dès 1 carat.", 90, color="#F6F3EE", anim="rise")]),
    ]
    return dict(name="E01_labo", music="181", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Ta pierre. <i>Ta bague.</i>", **FR)),
                glints=[dict(at=1.5, x=560, y=1080, s=0.8), dict(at=12, x=540, y=1150, s=0.6), dict(at=24, x=540, y=1000, s=0.9)])


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
