"""Wave 15 (12 Nov 2026): Rayane's OWN rings with motion design — hook, build-up, call to action.
- Cut-outs of his renders and photos (BiRefNet, cutout.py) on brand backgrounds, the ring floating with a reflection,
  giant type running BEHIND the ring (the effect of the reference edit), fast cuts on the beat.
- Montréal = what is true and ours: the two private offices, the atelier, his own B-roll. No stock city shot labelled Montréal.
- *_APP versions: silent, cut at 112 BPM (tempo of the trending emotional song Rayane sent, 12 Nov.), song added in the app.
Facts only from FAITS.md. Never a ring on the little finger (pro.BANNED). Usage: python3 reels_wave15.py [R01_montreal ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, WORK
from reels import ROSE_PEAR
import pro

CUT = os.environ.get("BETO_CUT_DIR", f"{WORK}/cut")   # cut-outs from cutout.py: <photo id>_bir.png
CAST = "u:dec72787-IMG_5717.mov"
EMERALD_BOX = "img:67dd756f-image.jpg"     # real photo: emerald-cut ring in a black velvet box
FR = dict(cta="Consultation gratuite — lien en bio", place="Montréal · ou en vidéo")
SPOT = "radial-gradient(ellipse 80% 55% at 50% 52%, #2B2721 0%, #15130F 55%, #0F0E0C 100%)"
IVORY_SPOT = "radial-gradient(ellipse 80% 55% at 50% 55%, #FFFFFF 0%, #F6F3EE 55%, #E9E3D8 100%)"
REELS = {}
APP_BPM = 112.0


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def b(cid, start, **kw):
    return S("b" + str(cid), start, 1, **kw)


def J(t, size=110, **kw):
    return dict(t=t, f="jost", w=900, size=size, **kw)


def BI(t, size=150, **kw):
    kw.setdefault("color", "#DABD86")
    return dict(t=t, f="bodI", w=400, size=size, upper=False, **kw)


def ring(k, at, until, **kw):
    d = dict(type="img", src=f"{CUT}/{k}_bir.png", at=at, until=until, out="cut", x=540, y=kw.pop("y", 820), w=kw.pop("w", 620))
    d.update(kw)
    return d


def reason(n, at, until, l1, l2, sub, y=230):
    """numbered reason card at the top: gold number, two kinetic lines, a small line of detail"""
    return [
        dict(type="stack", at=at, until=until, out="cut", y=y, every=0.35, lines=[
            BI(f"0{n}", 170, anim="pop"), J(l1, 96, anim="rise"), J(l2, 96, anim="rise", style="outline", stroke=4)]),
        dict(type="kicker", at=at + 1.2, until=until, out="cut", t=sub, y=y + 470, size=27, ls=".14em", color="#F6F3EE", shadow=True, w=500),
    ]


def _audio(spec, music, app):
    if app:
        spec["name"] += "_APP"; spec["music"] = None; spec["bpm"] = APP_BPM
    else:
        spec["music"] = music
    return spec


# ---- R01: « Pourquoi faire ta bague à Montréal ? » — 4 reasons, his rings, CTA
def _montreal(app):
    shots = [
        dict(shot=b(1621466, 0.1), beats=5, tr="cut"),                       # under the motion background
        dict(shot=b(1620314, 0.5, fx=["kenburns"]), beats=4, tr="cut"),      # Rayane in consultation
        dict(shot=b(1621466, 0.1), beats=4, tr="cut"),                       # under the motion background
        dict(shot=S(CAST, 0.2, 1, zoom=1.8, cx=532, cy=1248, fx=["kenburns"]), beats=4, tr="cut"),
        dict(shot=S(EMERALD_BOX, 0, 1, zoom=1.15, cx=756, cy=1000, fx=["kenburns", "glow"]), beats=4, tr="fadewhite"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    el = [
        # HOOK — text behind the ring
        dict(type="bg", at=-1, until=5, out="cut", css=SPOT),
        dict(type="marquee", at=-1, until=5, out="cut", t="MONTRÉAL", sep="  ·  ", y=930, size=250, f="jost", w=900, speed=170, dir=1, alpha=0.9),
        ring("f24a29df", -1, 5, y=760, w=520, anim="fade", float=10, reflect=True, glow=True, zoom=[1.0, 1.08]),
        dict(type="stack", at=-0.9, until=5, out="up", y=230, every=0.3, lines=[J("Pourquoi faire", 100), J("ta bague", 100), BI("à Montréal ?", 140, anim="pop")]),
        dict(type="flash", beats=[5, 9, 13, 17], alpha=0.35, decay=14),
        # 01 — meet your jeweler
        dict(type="scrim", at=5, until=9, out="cut", grad="top", h=1000),
        *reason(1, 5, 9, "Tu rencontres", "ton joaillier.", "Bureaux privés · centre-ville et Saint-Laurent"),
        # 02 — 3D design: his renders, one per beat
        dict(type="bg", at=9, until=13, out="cut", css=SPOT),
        ring("2330f1a8", 9, 10, y=900, w=700, anim="slam", reflect=True),
        ring("66fac60c", 10, 11, y=950, w=760, anim="slam", reflect=True),
        ring("f19cfa84", 11, 12, y=900, w=700, anim="slam", reflect=True),
        ring("5cb47fe1", 12, 13, y=920, w=720, anim="slam", reflect=True),
        *reason(2, 9, 13, "Design 3D", "en 48 h.", "Révisions incluses"),
        # 03 — ready in 2 weeks (casting)
        dict(type="scrim", at=13, until=17, out="cut", alpha=0.45),
        *reason(3, 13, 17, "Prête en", "2 semaines.", "Après ton approbation du design"),
        # 04 — certificate
        dict(type="scrim", at=17, until=21, out="cut", grad="top", h=1000),
        *reason(4, 17, 21, "Certifiée", "dès 1 carat.", "Certificat IGI · nettoyage et polissage à vie"),
    ]
    spec = dict(name="R01_montreal", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Ta bague, <i>faite à Montréal.</i>", **FR)),
                glints=[dict(at=1.5, x=560, y=840, s=0.8), dict(at=10.5, x=540, y=1000, s=0.7), dict(at=18.5, x=560, y=1150, s=0.8),
                        dict(at=22.5, x=540, y=930, s=0.9)])
    return _audio(spec, "1073", app)


@reel
def R01_montreal():
    return _montreal(False)


@reel
def R01_montreal_APP():
    return _montreal(True)


# ---- P01: payment in steps — DRAFT, not published until Rayane confirms his payment-plan terms.
#      Wording = the confirmed structure for website clients (brief §3bis): design deposit, 50 % at 3D approval, balance at handover.
@reel
def P01_paiement_DRAFT():
    BOXW = (60, 250, 960, 760, "0x0F0E0C")
    shots = [
        dict(shot=b(1621466, 0.1), beats=5, tr="cut"),
        dict(shot=S("img:44e2c708-image.jpg", 0, 1, box=BOXW, fx=["kenburns"]), beats=4, tr="smoothleft"),
        dict(shot=S("u:118b50e3-VIDEO-2026-11-01-11-01-49.mp4", 10.0, 1, box=BOXW, fx=["kenburns"]), beats=4, tr="smoothleft"),
        dict(shot=S("img:ef0863dd-image.jpg", 0, 1, box=BOXW, fx=["kenburns"]), beats=4, tr="fadewhite"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    steps = [dict(n=1, title="Dépôt de design", sub="Pour lancer ton design 3D", at=5.2),
             dict(n=2, title="50 % à l’approbation", sub="Quand ton design 3D te plaît", at=9),
             dict(n=3, title="Le solde à la remise", sub="Quand ta bague est prête", at=13)]
    el = [
        dict(type="bg", at=-1, until=5, out="cut", css=SPOT),
        dict(type="marquee", at=-1, until=5, out="cut", t="EN 3 ÉTAPES", sep="  ·  ", y=1000, size=190, f="jost", w=900, speed=150, dir=-1, alpha=0.85),
        ring("f19cfa84", -1, 5, y=860, w=600, anim="fade", float=10, reflect=True, glow=True, zoom=[1.0, 1.08]),
        dict(type="stack", at=-0.9, until=5, out="up", y=230, every=0.3, lines=[J("Pas besoin de", 96), J("tout payer", 96), BI("d’un coup.", 150, anim="pop")]),
        dict(type="flash", beats=[5], alpha=0.4),
        dict(type="brackets", at=5, until=17, out="cut", x=60, y=250, w=960, h=760, label="Ta bague · en 3 étapes"),
        dict(type="steps", at=5, until=17, out="cut", x=100, y=1100, w=920, gap=112, tsize=44, ssize=30, items=steps),
    ]
    return dict(name="P01_paiement_DRAFT", music="1073", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("On en parle <i>en consultation.</i>", **FR)),
                glints=[dict(at=1.5, x=540, y=920, s=0.8), dict(at=18.5, x=540, y=930, s=0.9)])


def sh(base, **kw):
    d = dict(base); d.update(kw); clip = d.pop("clip"); start = d.pop("start")
    return S(clip, start, 1.0, **d)


def chapter(at, until, name, era, line, y=230):
    """educational chapter card: small label, big gold era, one sentence that appears word by word"""
    return [
        dict(type="kicker", at=at, until=until, out="cut", t=name, y=y, size=34, color="#F6F3EE", shadow=True),
        dict(type="stack", at=at + 0.3, until=until, out="cut", y=y + 60, lines=[BI(era, 150, anim="pop")]),
        dict(type="text", at=at + 1.2, until=until, out="cut", anim="words", every=0.25, y=y + 250, size=58, color="#F6F3EE", t=line),
    ]


# ---- E03: « Chaque forme a une histoire » — marquise, poire, halo, alliance; facts from FAITS.md (legends marked)
@reel
def E03_histoires():
    shots = [
        dict(shot=b(1621466, 0.1), beats=6, tr="cut"),                                         # under the motion background
        dict(shot=sh(ROSE_PEAR, slowmo=True, fx=["kenburns", "glow"]), beats=5, tr="cut"),    # Rayane's pink lab-grown pear
        dict(shot=b(1621466, 0.1), beats=5, tr="cut"),                                         # under the motion background
        dict(shot=S("img:e4df707d-image.jpg", 0, 1, zoom=1.1, cx=756, cy=1100, fx=["kenburns", "glow"]), beats=5, tr="fadewhite"),
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    el = [
        # HOOK + marquise (legend)
        dict(type="bg", at=-1, until=6, out="cut", css=SPOT),
        dict(type="marquee", at=-1, until=6, out="cut", t="MARQUISE", sep="  ·  ", y=980, size=230, f="jost", w=900, speed=120, dir=1, alpha=0.85),
        ring("2330f1a8", -1, 6, y=880, w=640, anim="fade", float=10, reflect=True, glow=True, zoom=[1.0, 1.06]),
        dict(type="stack", at=-0.9, until=3, out="up", y=230, every=0.3, lines=[J("Chaque forme", 100), J("a une", 100), BI("histoire.", 150, anim="pop")]),
        dict(type="text", at=3, until=6, out="cut", anim="words", every=0.22, y=250, size=60, color="#F6F3EE",
             t="On raconte que Louis XV l’a fait tailler pour la marquise de Pompadour."),
        dict(type="flash", beats=[6, 11, 16], alpha=0.35, decay=14),
        # poire
        dict(type="scrim", at=6, until=11, out="cut", grad="top", h=1000),
        *chapter(6, 11, "La poire", "XVe siècle", "Attribuée à Lodewyk van Bercken, l’inventeur de la meule de polissage."),
        # halo
        dict(type="bg", at=11, until=16, out="cut", css=SPOT),
        dict(type="marquee", at=11, until=16, out="cut", t="ART DÉCO", sep="  ·  ", y=1000, size=230, f="jost", w=900, speed=120, dir=-1, alpha=0.85),
        ring("14677909", 11, 16, y=820, w=520, anim="scale", float=8, reflect=True, glow=True),
        *chapter(11, 16, "Le halo", "Années 1920", "Popularisé à l’époque Art déco. Ici, un halo caché, sous la pierre."),
        # alliance
        dict(type="scrim", at=16, until=21, out="cut", grad="top", h=1000),
        *chapter(16, 21, "L’alliance", "Sans fin", "Un cercle sans début ni fin : le symbole de l’éternité."),
    ]
    return dict(name="E03_histoires", music="659", shots=shots, texts=[], motion=dict(elements=el),
                end=dict(beats=5, overlay=True, layers=pro.end_overlay("Ta bague aura <i>son histoire.</i>", **FR)),
                glints=[dict(at=2, x=560, y=900, s=0.8), dict(at=8, x=560, y=1080, s=0.7), dict(at=13, x=540, y=900, s=0.7),
                        dict(at=22.5, x=540, y=930, s=0.9)])


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
