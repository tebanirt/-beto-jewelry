"""10 trial reels — colored lab-grown diamonds. Usage: python3 reels.py [R01 R02 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build

# ---------- shot library (curated moments, graded framing) ----------
ROSE_OVAL = dict(clip="rose", start=0.05, zoom=1.3, cx=1000, cy=1600)   # colourless oval ("blanc")
ROSE_PEAR = dict(clip="rose", start=1.35, zoom=1.35, cx=1200, cy=2000)
ROSE_PEAR2 = dict(clip="rose", start=2.15, zoom=1.35, cx=1200, cy=2050)
ROSE_MQ = dict(clip="rose", start=4.45, zoom=1.4, cx=1080, cy=2500)
ROSE_MQ2 = dict(clip="rose", start=5.05, zoom=1.4, cx=1080, cy=2550)
ROSE_EM = dict(clip="rose", start=6.2, zoom=1.4, cx=1080, cy=2600)
ROSE_EM2 = dict(clip="rose", start=6.85, zoom=1.4, cx=1080, cy=2650)
JAUNE = dict(clip="jaune", start=1.55, zoom=1.3, cx=1080, cy=2400)
JAUNE_B = dict(clip="jaune", start=5.25, zoom=1.45, cx=1080, cy=2200)
JAUNE_W = dict(clip="jaune", start=0.0, zoom=1.0, cx=1080, cy=1920)
BLEU_PEAR = dict(clip="bleu", start=1.35, zoom=1.3, cx=1080, cy=2000)
BLEU_RD = dict(clip="bleu", start=3.4, zoom=1.4, cx=1080, cy=2260)
BLEU_RD2 = dict(clip="bleu", start=4.6, zoom=1.45, cx=1080, cy=2270)
BLEU_W = dict(clip="bleu", start=0.0, zoom=1.0, cx=1080, cy=1920)
VERT_EM = dict(clip="vert", start=0.0, zoom=1.3, cx=1080, cy=1900)
VERT_OV = dict(clip="vert", start=4.4, zoom=1.45, cx=1080, cy=2150)
VERT_W = dict(clip="vert", start=8.0, zoom=1.0, cx=1080, cy=1920)


def sh(base, dur, offset=0.0, **kw):
    d = dict(base); d["start"] = base["start"] + offset; d.update(kw)
    clip = d.pop("clip"); start = d.pop("start")
    return ("shot", S(clip, start, dur, **d))


def end_solid(d):
    return ("solid", ("0xF6F3EE", d))


# ---------- text helpers ----------
def card(serif, over=None, det=None, src=None, size="s86", top=300, dark=False, maxw=None):
    cls = "card pad" + (" dark" if dark else "")
    style = f"top:{top}px" + (f";max-width:{maxw}px;white-space:normal" if maxw else "")
    h = f'<div class="{cls}" style="{style}">'
    if over: h += f'<span class="over">{over}</span>'
    h += f'<div class="serif {size}">{serif}</div>'
    if det: h += f'<span class="det">{det}</span>'
    if src: h += f'<span class="src">{src}</span>'
    return h + "</div>"


def label(n, txt, top=300):
    return f'<div class="card label" style="top:{top}px"><b>{n:02d}</b><span class="rule"></span>{txt}</div>'


def num(n, x, y):
    return f'<div class="num" style="left:{x}px;top:{y}px">{n}</div>'


def endcard(title, sub=None, details=None, cta=None, place="Montréal · ou en vidéo"):
    """returns layers dict for an ivory end card (ids e_logo, e_t, e_d, e_c)."""
    L = {"e_logo": '<img class="logo" style="top:330px" src="%LOGO%">'}
    t = f'<div class="ctr e1" style="top:630px">{title}</div>'
    y = 770 if "<br>" not in title else 840
    if sub:
        t += f'<div class="ctr e1s" style="top:{y}px">{sub}</div>'
        y += 130 if "<br>" in sub else 80
    t += f'<div class="rule2" style="top:{y}px"></div>'
    L["e_t"] = t
    y += 44
    L["e_d"] = f'<div class="ctr e2" style="top:{y}px">{details}</div>' if details else ""
    y += 92
    L["e_c"] = (f'<div class="btn" style="top:{y}px">{cta}</div>' if cta else "") + \
               f'<div class="ctr e4" style="top:{y + 140}px">{place}</div>'
    return L


def end_tl(t0, total):
    return [("e_logo", t0, 0.4, total, 0, 0), ("e_t", t0 + 0.15, 0.4, total, 0, 16),
            ("e_d", t0 + 0.45, 0.35, total, 0, 12), ("e_c", t0 + 0.7, 0.35, total, 0, 12)]


FR_END = dict(details="Design 3D en 48 h · Prête en 2 semaines", cta="Consultation gratuite — lien en bio")
EN_END = dict(details="3D design in 48 h · Ready in 2 weeks", cta="Free consultation — link in bio", place="Montréal · or by video")
SRC_GIA = "Source : GIA"
REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


# ======================================================================
@reel
def R01_blanc_ou_rose():
    items = [sh(ROSE_OVAL, 1.0, slowmo=True, fx=["kenburns"]),
             sh(ROSE_PEAR, 1.5, fx=["flash", "punch"]),
             sh(JAUNE, 0.5, 0.3, fx=["punch"]), sh(BLEU_PEAR, 0.5, 0.3, fx=["punch"]),
             sh(VERT_EM, 0.5, fx=["punch"]), sh(ROSE_MQ2, 0.5, fx=["punch"]),
             sh(BLEU_RD, 0.5, fx=["punch"]), sh(VERT_OV, 0.5, fx=["punch"]),
             sh(ROSE_EM2, 0.5, fx=["punch", "flash_out"]), end_solid(2.5)]
    L = {"h1": card("Tout le monde choisit<br>le <i>blanc</i>…", over="Beto Jewelry · Montréal"),
         "h2": card("… et si tu osais<br>le <i>rose</i> ?", size="s86")}
    L.update(endcard("Ta couleur. <i>Ta bague.</i>", "Diamants de laboratoire<br>rose · jaune · bleu · champagne · vert", **FR_END))
    tl = [("h1", 0, 0, 1.0, 0, 0), ("h2", 1.0, 0.12, 2.5, 0, 12)] + end_tl(6.0, 8.5)
    au = ([(0.98, "whoosh_rev"), (1.0, "impact"), (1.15, "sparkle")] + [(t, "tick") for t in (2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5)] +
          [(6.0, "impact", 0.7), (6.1, "sparkle")], "lux")
    return items, L, tl, au


@reel
def R02_couleur_science():
    items = [sh(ROSE_PEAR, 2.0, fx=["kenburns"]),
             sh(JAUNE, 2.5, slowmo=True, fx=["kenburns", "flash"]),
             sh(BLEU_PEAR, 2.5, fx=["kenburns", "flash"]),
             sh(ROSE_MQ, 1.5, fx=["flash", "kenburns"]), sh(VERT_OV, 1.5, fx=["kenburns"]),
             sh(ROSE_EM, 2.0, slowmo=True, fx=["flash", "kenburns", "flash_out"]), end_solid(3.0)]
    L = {"h": card("D’où vient la <i>couleur</i><br>d’un diamant ?", over="Diamants de couleur"),
         "c1": card("De l’<i>azote</i>.", over="Jaune", det="Des atomes d’azote dans le cristal<br>absorbent la lumière bleue.", src=SRC_GIA),
         "c2": card("Du <i>bore</i>.", over="Bleu", det="Moins d’un atome de bore<br>par million d’atomes de carbone.", src=SRC_GIA),
         "c3": card("Un traitement<br><i>après</i> la croissance.", over="Rose et vert · en laboratoire", det="Habituellement une irradiation,<br>puis un chauffage.", src=SRC_GIA, size="s72"),
         "c4": card("Un <i>vrai</i> diamant.", over="Diamant de laboratoire", det="Carbone pur, dureté 10.<br>Mêmes propriétés que le naturel.", src=SRC_GIA)}
    L.update(endcard("Choisis ta <i>couleur.</i>", "Envoie ça à quelqu’un<br>qui prépare la grande demande.", **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.2, 4.5, 0, 12), ("c2", 4.5, 0.2, 7.0, 0, 12),
          ("c3", 7.0, 0.2, 10.0, 0, 12), ("c4", 10.0, 0.2, 12.0, 0, 12)] + end_tl(12.0, 15.0)
    au = ([(t, "whoosh_rev", 0.6) for t in (2.0, 4.5, 7.0, 10.0)] + [(t + 0.05, "sparkle", 0.6) for t in (2.0, 4.5, 7.0, 10.0)] +
          [(12.0, "impact", 0.5)], "edu")
    return items, L, tl, au


@reel
def R03_mythe_labo():
    items = [sh(BLEU_PEAR, 2.0, fx=["kenburns_out"]),
             sh(JAUNE, 1.25, fx=["flash", "punch", "shake"]), sh(ROSE_PEAR, 1.25, 0.2, fx=["punch"]),
             sh(VERT_EM, 1.25, fx=["punch"]), sh(ROSE_MQ2, 1.25, fx=["punch", "flash_out"]), end_solid(2.5)]
    L = {"h": card("« Un diamant de labo,<br>c’est du <i>faux</i>. »", over="Mythe ou réalité ?"),
         "f": card("<i>Faux.</i>", size="s120", det="Carbone pur. Dureté 10.<br>Mêmes propriétés que le naturel.", src=SRC_GIA),
         "c": card("Et oui, il existe<br>en <i>couleur</i>.", over="Diamant de laboratoire")}
    L.update(endcard("Un vrai diamant.<br><i>Ta couleur.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("f", 2.0, 0.08, 4.5, 0, 0), ("c", 4.5, 0.2, 7.0, 0, 12)] + end_tl(7.0, 9.5)
    au = ([(2.0, "impact"), (1.98, "whoosh_rev"), (2.05, "sparkle"), (4.5, "tick"), (4.5, "sparkle", 0.6), (7.0, "impact", 0.6)], "lux")
    return items, L, tl, au


@reel
def R04_velocity():
    q = 0.25
    items = [sh(VERT_EM, 0.5, 0.2, fx=["punch", "shake", "rgb"]),
             sh(JAUNE, q, 0.5, fx=["punch", "rgb"]), sh(BLEU_PEAR, q, 0.4, fx=["punch"]),
             sh(ROSE_PEAR, q, 0.3, fx=["punch", "rgb"]), sh(ROSE_MQ2, q, fx=["punch"]),
             sh(BLEU_PEAR, 0.75, -0.1, speed=2.0, fx=["whip", "shake"]),
             sh(ROSE_PEAR2, 0.75, slowmo=True, fx=["flash", "kenburns"]),
             sh(JAUNE_B, q, fx=["punch", "rgb"]), sh(VERT_OV, q, fx=["punch"]),
             sh(BLEU_RD2, q, fx=["punch", "rgb"]), sh(ROSE_EM2, q, fx=["punch"]),
             ("grid", ([S(**{k: v for k, v in ROSE_PEAR.items()}, dur=1.0), S(**JAUNE, dur=1.0),
                        S(**BLEU_PEAR, dur=1.0), S(**VERT_EM, dur=1.0)], 1.0, ["flash"])),
             end_solid(2.5)]
    L = {"a": card("<i>4</i> couleurs.", size="s120", top=300),
         "b": card("<i>1</i> bague.", size="s120", top=300),
         "c": card("La <i>tienne</i>.", size="s120", top=820)}
    L.update(endcard("Beto <i>Jewelry</i>", "Bagues sur mesure", **FR_END))
    tl = [("a", 0, 0, 1.5, 0, 0), ("b", 2.25, 0.06, 3.0, 0, 0), ("c", 4.0, 0.06, 5.0, 0, 0)] + end_tl(5.0, 7.5)
    cuts = [0.5, 0.75, 1.0, 1.25, 1.5, 2.25, 3.0, 3.25, 3.5, 3.75, 4.0]
    au = ([(0.0, "impact"), (1.5, "whoosh"), (2.25, "impact", 0.8), (2.3, "sparkle"), (4.0, "impact"), (4.05, "sparkle"),
           (5.0, "impact", 0.7)] + [(t, "tick", 0.8) for t in cuts], "velocity")
    return items, L, tl, au


@reel
def R05_asmr_lumiere():
    items = [sh(VERT_EM, 2.5, 0.1, slowmo=True, fx=["kenburns"]),
             sh(ROSE_PEAR, 2.5, 0.1, slowmo=True, fx=["kenburns", "dip"]),
             sh(BLEU_PEAR, 2.5, 0.1, slowmo=True, fx=["kenburns", "dip"]),
             sh(JAUNE, 2.5, 0.1, slowmo=True, fx=["kenburns", "dip"])]
    L = {"h": card("Regarde la <i>lumière</i>.", size="s72", top=300),
         "f": card("Beto <i>Jewelry</i>", over="Montréal", det="Bagues de fiançailles sur mesure<br>Consultation gratuite, à Montréal ou en vidéo", size="s72", top=300)}
    tl = [("h", 0, 0, 2.3, 0.3, 0), ("f", 7.6, 0.5, 10.0, 0, 14)]
    au = ([(0.3, "sparkle", 0.7), (2.6, "sparkle", 0.8), (5.1, "sparkle", 0.8), (7.6, "sparkle", 0.9), (8.6, "sparkle", 0.6)], "ambient")
    return items, L, tl, au


@reel
def R06_rose_rare():
    items = [sh(ROSE_PEAR2, 2.5, -0.6, slowmo=True, fx=["kenburns"]),
             sh(ROSE_MQ, 1.5, fx=["flash", "punch"]), sh(ROSE_EM, 1.5, -0.3, fx=["punch"]),
             sh(ROSE_PEAR2, 1.5, 0.0, fx=["punch", "flash_out"]), end_solid(2.5)]
    L = {"h": card("Parmi les plus <i>rares</i><br>au monde.", over="Le diamant rose",
                   det="En 2017, un diamant rose naturel de 59,60 carats<br>s’est vendu 71,2 M$ US.", src=SRC_GIA),
         "c": card("En laboratoire,<br>il devient <i>possible</i>.", over="Diamant de laboratoire rose")}
    L.update(endcard("Ton diamant <i>rose</i>,<br>sur mesure.", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.15, 7.0, 0, 12)] + end_tl(7.0, 9.5)
    au = ([(2.48, "whoosh_rev"), (2.5, "impact", 0.8), (2.55, "sparkle"), (4.0, "tick"), (5.5, "tick"), (7.0, "impact", 0.6)], "lux")
    return items, L, tl, au


@reel
def R07_pov():
    items = [sh(JAUNE, 2.5, -0.2, slowmo=True, fx=["kenburns"]),
             sh(BLEU_PEAR, 0.5, 0.2, fx=["flash", "punch"]), sh(VERT_EM, 0.5, fx=["punch"]),
             sh(ROSE_PEAR, 0.5, 0.3, fx=["punch"]), sh(ROSE_MQ2, 0.5, fx=["punch"]),
             sh(ROSE_PEAR2, 2.0, slowmo=True, fx=["kenburns", "flash_out"]), end_solid(2.5)]
    L = {"h": card("<i>POV</i> : elle veut une bague<br>que personne d’autre n’a.", size="s72"),
         "c": card("Alors on la crée.<br><i>Pour elle.</i>", over="Design 3D en 48 h")}
    L.update(endcard("Envoie ça à quelqu’un<br>qui doit faire <i>la demande</i>.", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 4.5, 0.2, 6.5, 0, 12)] + end_tl(6.5, 9.0)
    au = ([(2.48, "whoosh_rev"), (2.5, "impact", 0.7)] + [(t, "tick") for t in (3.0, 3.5, 4.0)] +
          [(4.5, "sparkle"), (6.5, "impact", 0.6)], "lux")
    return items, L, tl, au


@reel
def R08_grille_choix():
    cells = [S(**ROSE_PEAR, dur=5.0, slowmo=True), S("jaune", 4.05, 5.0, zoom=1.4, cy=2300, slowmo=True),
             S(**BLEU_PEAR, dur=5.0, slowmo=True), S(**VERT_EM, dur=5.0, slowmo=True)]
    items = [("grid", (cells, 5.0, [])), end_solid(2.0)]
    L = {"q": card("Laquelle tu <i>choisis</i> ?", size="s72", top=850),
         "n": num(1, 66, 300) + num(2, 612, 300) + num(3, 66, 1010) + num(4, 612, 1010),
         "r": card("Réponds 1, 2, 3 ou 4 en commentaire", size="s62", top=1100, maxw=940)}
    L.update(endcard("Ta couleur, <i>ta bague</i>.", None, **FR_END))
    tl = [("q", 0, 0, 5.0, 0, 0), ("n", 0, 0, 5.0, 0, 0), ("r", 1.0, 0.3, 5.0, 0, 12)] + end_tl(5.0, 7.0)
    au = ([(0.0, "sparkle", 0.6), (1.0, "tick"), (2.5, "sparkle", 0.5), (5.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def R09_devine():
    items = [sh(ROSE_PEAR, 2.6, -0.05, slowmo=True, fx=["bw", "kenburns"]),
             sh(ROSE_PEAR, 1.0, 1.25, fx=["flash", "punch"]),
             sh(ROSE_MQ2, 0.75, fx=["punch"]), sh(ROSE_EM2, 0.75, -0.2, fx=["punch", "flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Devine sa <i>couleur</i>.", over="Diamant de laboratoire", size="s86"),
         "n3": '<div class="ctr count" style="top:820px">3</div>',
         "n2": '<div class="ctr count" style="top:820px">2</div>',
         "n1": '<div class="ctr count" style="top:820px">1</div>',
         "r": card("<i>Rose.</i>", size="s120", det="T’avais deviné ? Dis-le en commentaire.")}
    L.update(endcard("Choisis ta <i>couleur.</i>", "rose · jaune · bleu · champagne · vert", **FR_END))
    tl = [("h", 0, 0, 2.6, 0, 0), ("n3", 0.5, 0.05, 1.2, 0.1, 0), ("n2", 1.2, 0.05, 1.9, 0.1, 0),
          ("n1", 1.9, 0.05, 2.6, 0.1, 0), ("r", 2.6, 0.06, 5.1, 0, 0)] + end_tl(5.1, 7.6)
    au = ([(0.5, "tick"), (1.2, "tick"), (1.9, "tick"), (2.58, "whoosh_rev"), (2.6, "impact"), (2.65, "sparkle"),
           (3.6, "tick"), (4.35, "tick"), (5.1, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def R10_EN_colour_science():
    items = [sh(VERT_OV, 2.0, fx=["kenburns"]),
             sh(JAUNE_B, 2.5, -0.4, fx=["kenburns", "flash"]),
             sh(BLEU_RD, 2.5, fx=["kenburns", "flash"]),
             sh(ROSE_MQ2, 1.5, fx=["flash", "kenburns"]), sh(VERT_EM, 1.5, fx=["kenburns"]),
             sh(ROSE_PEAR2, 2.0, slowmo=True, fx=["flash", "kenburns", "flash_out"]), end_solid(3.0)]
    L = {"h": card("What gives a diamond<br>its <i>colour</i>?", over="Coloured diamonds"),
         "c1": card("<i>Nitrogen</i>.", over="Yellow", det="Nitrogen atoms in the crystal<br>absorb blue light.", src="Source: GIA"),
         "c2": card("<i>Boron</i>.", over="Blue", det="Less than one boron atom<br>per million carbon atoms.", src="Source: GIA"),
         "c3": card("A treatment<br><i>after</i> growth.", over="Pink & green · lab-grown", det="Usually irradiation,<br>then heating.", src="Source: GIA", size="s72"),
         "c4": card("A <i>real</i> diamond.", over="Lab-grown diamond", det="Pure carbon, hardness 10.<br>Same properties as natural.", src="Source: GIA")}
    L.update(endcard("Choose your <i>colour.</i>", "Send this to someone<br>planning the big question.", **EN_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.2, 4.5, 0, 12), ("c2", 4.5, 0.2, 7.0, 0, 12),
          ("c3", 7.0, 0.2, 10.0, 0, 12), ("c4", 10.0, 0.2, 12.0, 0, 12)] + end_tl(12.0, 15.0)
    au = ([(t, "whoosh_rev", 0.6) for t in (2.0, 4.5, 7.0, 10.0)] + [(t + 0.05, "sparkle", 0.6) for t in (2.0, 4.5, 7.0, 10.0)] +
          [(12.0, "impact", 0.5)], "edu")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
