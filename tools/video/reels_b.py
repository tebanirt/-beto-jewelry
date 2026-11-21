"""Wave 2 — trial reels from the videographer's b-roll (consultation shoot) + colored lab diamonds.
Usage: python3 reels_b.py [B01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, endcard, end_tl, end_solid, sh, FR_END, EN_END, ROSE_PEAR

REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def b(cid, start, dur, **kw):
    return ("shot", S("b" + str(cid), start, dur, **kw))


def ticks(times, g=0.8):
    return [(t, "tick", g) for t in times]


@reel
def B01_etapes():
    items = [b(1617419, 0.2, 2.0, fx=["kenburns"]),
             b(1619438, 0.2, 1.5, fx=["punch"]), b(1618811, 0.3, 1.5, fx=["kenburns"]),
             b(1626602, 0.2, 2.0, fx=["kenburns", "flash"]), b(1627599, 0.1, 1.0, fx=["punch"]),
             b(1632578, 0.1, 1.5, fx=["kenburns", "flash"]), b(1632222, 0.0, 1.0, fx=["punch"]),
             b(1630385, 0.0, 1.0, fx=["flash_out"]), end_solid(2.5)]
    L = {"h": card("Ta bague de fiançailles,<br>étape par <i>étape</i>.", over="Beto Jewelry · Montréal", size="s72"),
         "c1": card("On choisit ta <i>pierre</i>.", over="01 — Consultation gratuite", det="En personne à Montréal ou en vidéo"),
         "c2": card("On dessine ta <i>bague</i>.", over="02 — Design 3D en 48 h", det="Révisions incluses"),
         "c3": card("Elle est <i>à toi</i>.", over="03 — Prête en 2 semaines")}
    L.update(endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.18, 5.0, 0, 12), ("c2", 5.0, 0.18, 8.0, 0, 12),
          ("c3", 8.0, 0.18, 10.5, 0, 12)] + end_tl(11.5, 14.0)
    au = ([(2.0, "whoosh_rev", 0.6), (5.0, "whoosh_rev", 0.6), (5.05, "sparkle", 0.5), (8.0, "whoosh_rev", 0.6),
           (8.05, "sparkle", 0.7), (11.5, "impact", 0.6)] + ticks([3.5, 7.0, 9.5, 10.5]), "lux")
    return items, L, tl, au


@reel
def B02_pov_consultation():
    q = 0.5
    seq = [(1619751, 0.3), (1620766, 0.1), (1617830, 0.4), (1621466, 0.1), (1622069, 0.2), (1626602, 0.6),
           (1631022, 0.3), (1632324, 0.1), (1632578, 0.4), (1656960, 0.2)]
    items = [b(1617419, 0.5, 1.5, fx=["kenburns"])] + [b(c, s, q, fx=["punch"] + (["rgb"] if i % 3 == 2 else []))
                                                        for i, (c, s) in enumerate(seq)] + [end_solid(2.0)]
    L = {"h": card("<i>POV</i> : ta consultation<br>de bague de fiançailles.", size="s72")}
    L.update(endcard("Ton tour <i>arrive.</i>", "Consultation gratuite<br>à Montréal ou en vidéo", **FR_END))
    tl = [("h", 0, 0, 1.5, 0, 0)] + end_tl(6.5, 8.5)
    au = ([(1.48, "whoosh_rev"), (1.5, "impact", 0.8)] + ticks([2.0 + 0.5 * i for i in range(9)]) + [(6.5, "impact", 0.7)], "velocity")
    return items, L, tl, au


@reel
def B03_essayage():
    items = [b(1632222, 0.0, 2.0, slowmo=True, fx=["kenburns"]), b(1632324, 0.0, 1.5, slowmo=True, fx=["dip"]),
             b(1632578, 0.2, 1.5, slowmo=True, fx=["dip"]), b(1632718, 0.2, 1.5, slowmo=True, fx=["dip"]),
             b(1632967, 0.0, 1.0, fx=["flash_out"]), end_solid(2.5)]
    L = {"h": card("Le moment où elle<br>l’<i>essaie</i>.", size="s86"),
         "c": card("Ce moment-là,<br><i>on le crée avec toi.</i>", size="s72")}
    L.update(endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c", 3.5, 0.3, 7.5, 0, 14)] + end_tl(7.5, 10.0)
    au = ([(0.2, "sparkle", 0.6), (2.0, "sparkle", 0.6), (3.5, "sparkle", 0.6), (5.0, "sparkle", 0.6), (7.5, "impact", 0.5)], "ambient")
    return items, L, tl, au


@reel
def B04_idee_a_bague():
    items = [b(1631410, 0.3, 1.5, fx=["kenburns"]), b(1626602, 0.1, 2.0, fx=["kenburns", "flash"]),
             b(1626012, 3.5, 1.0, fx=["punch"]), b(1656960, 0.1, 1.5, fx=["kenburns", "flash"]),
             b(1657215, 0.1, 1.0, fx=["flash_out"]), end_solid(2.5)]
    L = {"h": card("De ton <i>idée</i>…", size="s100"),
         "c1": card("… à ton design <i>3D</i>", over="En 48 h · révisions incluses", size="s86"),
         "c2": card("… à <i>ta</i> bague.", over="Prête en 2 semaines", size="s100")}
    L.update(endcard("Raconte-nous <i>ton idée.</i>", None, **FR_END))
    tl = [("h", 0, 0, 1.5, 0, 0), ("c1", 1.5, 0.12, 4.5, 0, 12), ("c2", 4.5, 0.12, 7.0, 0, 12)] + end_tl(7.0, 9.5)
    au = ([(1.48, "whoosh_rev"), (1.5, "impact", 0.6), (3.5, "tick"), (4.48, "whoosh_rev"), (4.5, "impact", 0.7),
           (4.55, "sparkle"), (7.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def B05_joaillier():
    items = [b(1620314, 0.5, 2.5, fx=["kenburns"]), b(1631850, 0.3, 2.0, fx=["punch"]),
             b(1619751, 0.5, 1.5, fx=["kenburns"]), b(1630568, 0.0, 1.0, fx=["flash_out"]), end_solid(2.5)]
    L = {"h": card("Ton joaillier,<br><i>c’est lui.</i>", over="Beto Jewelry · Montréal", size="s86"),
         "c": card("<i>500+</i> créations<br>sur mesure.", over="Rayane · DEP en bijouterie", det="En français ou en anglais", size="s86")}
    L.update(endcard("Parle-lui de <i>ta</i> bague.", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c", 2.5, 0.15, 7.0, 0, 12)] + end_tl(7.0, 9.5)
    au = ([(2.48, "whoosh_rev"), (2.5, "impact", 0.7), (4.5, "tick"), (6.0, "tick"), (7.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def B06_inclus():
    items = [b(1656836, 0.1, 2.0, fx=["kenburns"]),
             b(1620766, 0.1, 1.0, fx=["flash", "punch"]), b(1621163, 0.1, 1.0, fx=["punch"]),
             b(1622069, 0.1, 2.0, fx=["kenburns", "flash"]), b(1632578, 0.2, 2.0, fx=["kenburns", "flash"]),
             b(1624169, 0.3, 2.0, fx=["kenburns", "flash"]), b(1657215, 0.1, 2.0, fx=["kenburns", "flash", "flash_out"]),
             end_solid(3.0)]
    L = {"h": card("Ce qui est <i>inclus</i><br>avec ta bague.", over="Beto Jewelry", size="s86"),
         "c1": card("Certificat <i>IGI</i>", over="01", det="Pour toute pierre de 1 carat et plus"),
         "c2": card("Certificat d’<i>authenticité</i>", over="02", det="De ta bague, pour la faire assurer", size="s72"),
         "c3": card("Mise à grandeur <i>offerte</i>", over="03", det="Un ajustement après la réception", size="s72"),
         "c4": card("Nettoyage et polissage<br><i>à vie</i>", over="04", size="s72"),
         "c5": card("Garantie de <i>12 mois</i>", over="05", det="Sur les défauts de fabrication")}
    L.update(endcard("Ta bague, <i>sans surprise.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.15, 4.0, 0, 10), ("c2", 4.0, 0.15, 6.0, 0, 10),
          ("c3", 6.0, 0.15, 8.0, 0, 10), ("c4", 8.0, 0.15, 10.0, 0, 10), ("c5", 10.0, 0.15, 12.0, 0, 10)] + end_tl(12.0, 15.0)
    au = ([(t, "whoosh_rev", 0.5) for t in (2.0, 4.0, 6.0, 8.0, 10.0)] + [(t + 0.05, "sparkle", 0.5) for t in (2.0, 4.0, 6.0, 8.0, 10.0)] +
          [(12.0, "impact", 0.5)], "edu")
    return items, L, tl, au


@reel
def B07_couleur_a_bague():
    items = [sh(ROSE_PEAR, 2.0, slowmo=True, fx=["kenburns"]),
             b(1619438, 0.3, 1.5, fx=["flash", "punch"]), b(1618811, 0.5, 1.0, fx=["punch"]),
             b(1632718, 0.1, 1.5, slowmo=True, fx=["flash", "kenburns"]), b(1656960, 0.3, 1.0, fx=["flash_out"]),
             end_solid(2.5)]
    L = {"h": card("Ta pierre de <i>couleur</i>…", over="Diamant de laboratoire", size="s86"),
         "c1": card("… choisie <i>avec toi</i>…", size="s86"),
         "c2": card("… devient <i>ta</i> bague.", size="s86")}
    L.update(endcard("Choisis ta <i>couleur.</i>", "rose · jaune · bleu · champagne · vert", **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.12, 4.5, 0, 12), ("c2", 4.5, 0.12, 7.0, 0, 12)] + end_tl(7.0, 9.5)
    au = ([(1.98, "whoosh_rev"), (2.0, "impact", 0.6), (3.5, "tick"), (4.48, "whoosh_rev"), (4.5, "impact", 0.7),
           (4.55, "sparkle"), (7.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def B08_ecrin():
    items = [b(1657215, 0.1, 2.0, fx=["kenburns"]), b(1656960, 0.1, 1.5, fx=["punch"]),
             b(1657341, 0.0, 1.0, fx=["punch"]), b(1656836, 0.1, 1.5, fx=["kenburns", "flash_out"]), end_solid(2.0)]
    L = {"h": card("Il ne manque plus<br>que <i>la question</i>.", size="s86")}
    L.update(endcard("Envoie ça à quelqu’un<br>qui doit faire <i>la demande</i>.", None, **FR_END))
    tl = [("h", 0, 0, 6.0, 0.3, 0)] + end_tl(6.0, 8.0)
    au = ([(0.1, "sparkle", 0.7), (2.0, "tick"), (3.5, "tick"), (4.5, "sparkle", 0.6), (6.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def B09_EN_steps():
    items = [b(1619751, 0.2, 2.0, fx=["kenburns"]),
             b(1617830, 0.2, 1.5, fx=["punch"]), b(1620766, 0.0, 1.5, fx=["kenburns"]),
             b(1626602, 0.4, 2.0, fx=["kenburns", "flash"]), b(1628298, 0.3, 1.0, fx=["punch"]),
             b(1632718, 0.1, 1.5, fx=["kenburns", "flash"]), b(1632324, 0.0, 1.0, fx=["punch"]),
             b(1630385, 0.0, 1.0, fx=["flash_out"]), end_solid(2.5)]
    L = {"h": card("Your engagement ring,<br>step by <i>step</i>.", over="Beto Jewelry · Montréal", size="s72"),
         "c1": card("We choose your <i>stone</i>.", over="01 — Free consultation", det="In person in Montréal or by video"),
         "c2": card("We design your <i>ring</i>.", over="02 — 3D design in 48 h", det="Revisions included"),
         "c3": card("It’s <i>yours</i>.", over="03 — Ready in 2 weeks")}
    L.update(endcard("Your ring,<br><i>made to measure.</i>", None, **EN_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.18, 5.0, 0, 12), ("c2", 5.0, 0.18, 8.0, 0, 12),
          ("c3", 8.0, 0.18, 10.5, 0, 12)] + end_tl(11.5, 14.0)
    au = ([(2.0, "whoosh_rev", 0.6), (5.0, "whoosh_rev", 0.6), (5.05, "sparkle", 0.5), (8.0, "whoosh_rev", 0.6),
           (8.05, "sparkle", 0.7), (11.5, "impact", 0.6)] + ticks([3.5, 7.0, 9.5, 10.5]), "lux")
    return items, L, tl, au


@reel
def B10_bureau_ou_video():
    items = [b(1626012, 1.0, 2.0, fx=["kenburns"]), b(1628298, 0.2, 1.5, fx=["punch"]),
             b(1617419, 0.4, 2.0, fx=["kenburns", "flash"]), b(1624583, 0.1, 1.0, fx=["punch", "flash_out"]), end_solid(2.5)]
    L = {"h": card("Pas besoin de<br>te <i>déplacer</i>.", over="Consultation gratuite", size="s86"),
         "c1": card("En <i>vidéo</i>…", size="s100"),
         "c2": card("… ou dans nos bureaux<br>privés à <i>Montréal</i>.", size="s72")}
    L.update(endcard("Comme <i>tu</i> préfères.", "En français ou en anglais", **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c1", 2.0, 0.12, 3.5, 0, 12), ("c2", 3.5, 0.12, 6.5, 0, 12)] + end_tl(6.5, 9.0)
    au = ([(1.98, "whoosh_rev"), (2.0, "impact", 0.6), (3.48, "whoosh_rev"), (3.5, "impact", 0.6), (5.5, "tick"),
           (6.5, "impact", 0.5)], "lux")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
