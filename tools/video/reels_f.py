"""Wave 6 — 3D render vs real ring (three-stone, marquise, oval pavé), portfolio, shape vote, IGI inscription.
Usage: python3 reels_f.py [F01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, label, num, endcard, end_tl, end_solid, FR_END, EN_END

REELS = {}
R3S_F, R3S_Q = "img:66fac60c-image.jpg", "img:e0126114-image.jpg"       # renders: three-stone oval, twisted band (white gold)
P3S_F, P3S_S = "img:ce39d97b-image.jpg", "img:ba0c6f27-image.jpg"       # photos of the finished three-stone
RMA_S, RMA_Q = "img:4d3f79c8-image.jpg", "img:b238511f-image.jpg"       # renders: marquise, alternating marquise/round band
PMA_F, PMA_S = "img:37721e80-image.jpg", "img:bd2f379f-image.jpg"       # photos of the finished marquise
R_PAVE, POV_PAVE = "img:5cb47fe1-image.jpg", "img:1c6e1795-image.jpg"   # render + photo: oval, pavé band
CAD2 = "u:ff494d11-VIDEO-2026-10-27-22-13-38.mp4"                         # CAD turntable of the oval pavé
PMQ_F = "img:e9997fda-image.jpg"      # marquise solitaire, yellow gold
POV_PLAIN = "img:2637c0bf-image.jpg"  # oval solitaire, yellow gold
PPR_F = "img:0590e1e4-image.jpg"      # princess, split shank pavé
P_HALO = "img:6785b0ea-image.jpg"     # oval, hidden halo
IGI = "img:igi_blur-image.jpg"        # IGI laser inscription under microscope (digits blurred)
# ring centre in each 1512x2016 photo (for a tighter crop)
POS = {P3S_F: (750, 1000), P3S_S: (760, 980), PMA_F: (720, 900), PMA_S: (720, 900), POV_PAVE: (680, 950),
       PMQ_F: (690, 900), POV_PLAIN: (680, 880), PPR_F: (640, 860), P_HALO: (780, 1010)}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def photo(p, dur, z=1.35, **kw):
    cx, cy = POS.get(p, (756, 1008))
    return ("shot", S(p, 0, dur, zoom=z, cx=cx, cy=cy, **kw))


def render(r, dur, **kw):
    return ("shot", S(r, 0, dur, fit=True, **kw))


def _rvr(r1, p1, r2, p2, over, lang="fr"):
    items = [render(r1, 2.0, fx=["kenburns"]), photo(p1, 2.0, fx=["flash", "kenburns"]),
             render(r2, 1.0, fx=["punch"]), photo(p2, 1.5, fx=["punch", "flash_out"]), end_solid(2.5)]
    if lang == "fr":
        L = {"h": card("Le rendu <i>3D</i>…", over=over, size="s100"), "c": card("… la vraie <i>bague</i>.", size="s100")}
        L.update(endcard("Du rendu <i>à ta main.</i>", None, **FR_END))
    else:
        L = {"h": card("The 3D <i>render</i>…", over=over, size="s100"), "c": card("… the real <i>ring</i>.", size="s100")}
        L.update(endcard("From render<br><i>to reality.</i>", None, **EN_END))
    tl = [("h", 0, 0, 2.0, 0, 0), ("c", 2.0, 0.08, 6.5, 0, 0)] + end_tl(6.5, 9.0)
    au = ([(0.1, "sparkle", 0.5), (1.98, "whoosh_rev"), (2.0, "impact", 0.8), (2.05, "sparkle"), (4.0, "tick"),
           (5.0, "tick"), (6.5, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def F01_3pierres_rendu_vs_reel():
    return _rvr(R3S_F, P3S_F, R3S_Q, P3S_S, "Trois pierres · anneau torsadé")


@reel
def F02_marquise_rendu_vs_reel():
    return _rvr(RMA_Q, PMA_F, RMA_S, PMA_S, "Marquise · pierres alternées")


@reel
def F03_ovale_pave():
    items = [("shot", S(CAD2, 0.0, 2.0, fit=True, fx=["kenburns"])), render(R_PAVE, 1.5, fx=["flash", "punch"]),
             photo(POV_PAVE, 2.5, fx=["flash", "kenburns", "flash_out"]), end_solid(2.5)]
    L = {"h": card("De l’animation <i>3D</i>…", over="Ovale · anneau pavé", size="s86"),
         "c": card("… à la vraie <i>bague</i>.", size="s100")}
    L.update(endcard("Design 3D <i>en 48 h.</i>", None, **FR_END))
    tl = [("h", 0, 0, 3.5, 0, 0), ("c", 3.5, 0.08, 6.0, 0, 0)] + end_tl(6.0, 8.5)
    au = ([(0.1, "sparkle", 0.5), (2.0, "whoosh_rev", 0.5), (3.48, "whoosh_rev"), (3.5, "impact", 0.8), (3.55, "sparkle"),
           (6.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def F04_portfolio():
    seq = [(PMQ_F, "Marquise"), (PPR_F, "Princesse"), (P3S_F, "Trois pierres"), (POV_PAVE, "Ovale pavé"),
           (PMA_F, "Marquise alternée"), (P_HALO, "Halo caché")]
    items = [photo(POV_PLAIN, 2.0, fx=["kenburns"])] + [photo(p, 1.0, fx=["punch"] + (["flash"] if i == 0 else []))
                                                       for i, (p, _) in enumerate(seq)] + [end_solid(2.5)]
    L = {"h": card("Chaque bague<br>est <i>unique</i>.", over="Créations Beto Jewelry", size="s86")}
    for i, (_, t) in enumerate(seq):
        L[f"l{i}"] = label(i + 1, t)
    L.update(endcard("La prochaine,<br><i>c’est la tienne.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.0, 0, 0)] + [(f"l{i}", 2.0 + i, 0.08, 3.0 + i, 0, 10) for i in range(len(seq))] + end_tl(8.0, 10.5)
    au = ([(0.1, "sparkle", 0.5), (1.98, "whoosh_rev"), (2.0, "impact", 0.7)] + [(2.0 + i, "tick") for i in range(1, 6)] +
          [(8.0, "impact", 0.6)], "lux")
    return items, L, tl, au


@reel
def F05_quelle_forme():
    cells = [S(p, 0, 5.0, zoom=1.5, cx=POS[p][0], cy=POS[p][1], fx=["kenburns"]) for p in (POV_PLAIN, PMQ_F, PPR_F, P3S_F)]
    items = [("grid", (cells, 5.0, [])), end_solid(2.0)]
    L = {"q": card("Ta forme <i>préférée</i> ?", size="s72", top=850),
         "n": num(1, 66, 300) + num(2, 612, 300) + num(3, 66, 1010) + num(4, 612, 1010),
         "r": card("Ovale, marquise, princesse<br>ou trois pierres ?", size="s62", top=1080)}
    L.update(endcard("Ta forme, <i>ta bague.</i>", None, **FR_END))
    tl = [("q", 0, 0, 5.0, 0, 0), ("n", 0, 0, 5.0, 0, 0), ("r", 1.0, 0.3, 5.0, 0, 12)] + end_tl(5.0, 7.0)
    au = ([(0.0, "sparkle", 0.6), (1.0, "tick"), (2.5, "sparkle", 0.5), (5.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def F06_igi_grave():
    items = [("shot", S(IGI, 0, 2.5, zoom=1.0, fx=["kenburns"])), photo(PMQ_F, 2.0, fx=["flash", "kenburns"]),
             photo(POV_PLAIN, 2.0, fx=["flash", "kenburns", "flash_out"]), end_solid(2.5)]
    L = {"h": card("Ton certificat IGI,<br><i>gravé</i> sur la pierre.", over="Vu au microscope", size="s72"),
         "c1": card("Un numéro gravé au laser<br>sur le <i>rondiste</i>.", det="Le même que sur le certificat.", size="s62"),
         "c2": card("Certificat IGI pour toute pierre<br>de <i>1 carat</i> et plus.", size="s62")}
    L.update(endcard("Tu sais <i>ce que tu as.</i>", None, **FR_END))
    tl = [("h", 0, 0, 2.5, 0, 0), ("c1", 2.5, 0.15, 4.5, 0, 12), ("c2", 4.5, 0.15, 6.5, 0, 12)] + end_tl(6.5, 9.0)
    au = ([(0.2, "tick"), (2.48, "whoosh_rev"), (2.5, "impact", 0.6), (2.55, "sparkle"), (4.5, "whoosh_rev", 0.5),
           (4.55, "sparkle", 0.6), (6.5, "impact", 0.5)], "edu")
    return items, L, tl, au


@reel
def F07_EN_render_vs_real():
    return _rvr(RMA_S, PMA_S, RMA_Q, PMA_F, "Marquise · alternating stones", lang="en")


@reel
def F08_velocity_bagues():
    seq = [POV_PLAIN, PMQ_F, PPR_F, P3S_F, POV_PAVE, PMA_F, P_HALO, P3S_S, PMA_S, PMQ_F]
    items = [photo(p, 0.5, z=1.5, fx=["punch"] + (["rgb"] if i % 3 == 1 else []) + (["shake"] if i in (0, 5) else []))
             for i, p in enumerate(seq)] + [end_solid(2.0)]
    L = {"a": card("Design 3D en <i>48 h</i>.", size="s86"), "b": card("Prête en <i>2 semaines</i>.", size="s86")}
    L.update(endcard("Ta bague, <i>sur mesure.</i>", None, **FR_END))
    tl = [("a", 0, 0, 2.5, 0, 0), ("b", 2.5, 0.06, 5.0, 0, 0)] + end_tl(5.0, 7.0)
    au = ([(0.0, "impact"), (2.5, "impact", 0.8), (2.55, "sparkle"), (5.0, "impact", 0.7)] +
          [(0.5 * i, "tick", 0.8) for i in range(1, 10)], "velocity")
    return items, L, tl, au


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
