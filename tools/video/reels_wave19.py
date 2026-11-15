"""Wave 19 (15 Nov 2026): the price-hook reel in every cut (Rayane: « à la place de faire seulement rond, fais toutes
les différentes coupes, plus de chance de go viral »), plus one reel with all the cuts.

Format of the niche's winners (DONNEES.md §12): model + cut + carat + price on the first card, readable at 0 s, then the
ring's spec sheet one line at a time. The site's price does not depend on the cut (engagementPriceTable.server.ts has no
shape input), so the approved range (2 ct lab-grown solitaire, 18k white gold, 2 300 to 2 400 $ + tax) holds for every cut.

What is on screen, by rule (brief §10, FAITS.md):
- under the model and the price: Rayane only;
- the cut is shown as a gold line drawing (a diagram, clearly a drawing, never a fake photo);
- real ring footage only when it is the same cut AND white (QC 15 Nov): round = b1656960 (white gold), marquise =
  b1657341 (white metal), no white oval (the ruler of loose ovals, b1617830 and b1618811, is banned: stones on the client's fingers, pinky
  included; b1657215 is a PINK oval): never
  under a white-diamond spec. Other cuts: loose stones in their tray;
- the reel ends on Rayane, under the review and the end card.
Usage: python3 reels_wave19.py [C_ovale ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pro
from reels_pro4 import _avis, b

REELS = {}
GOLD = "#a8875a"


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def _svg(inner, w=200, h=260):
    return (f'<svg viewBox="0 0 {w} {h}" width="240" height="{int(240 * h / w)}" style="display:block;margin:6px auto 14px" '
            f'fill="none" stroke="{GOLD}" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">{inner}</svg>')


# Top-view line drawings: outline, table and a few facet lines. Diagrams, not photos.
SVG = {
    "rond": _svg('<circle cx="100" cy="130" r="88"/><polygon points="100,82 134,96 148,130 134,164 100,178 66,164 52,130 66,96"/>'
                 '<path d="M100 42 L100 82 M162 68 L134 96 M188 130 L148 130 M162 192 L134 164 M100 218 L100 178 M38 192 L66 164 M12 130 L52 130 M38 68 L66 96"/>'),
    "ovale": _svg('<ellipse cx="100" cy="130" rx="70" ry="112"/><ellipse cx="100" cy="130" rx="36" ry="62"/>'
                  '<path d="M100 18 L100 68 M100 192 L100 242 M30 130 L64 130 M170 130 L136 130 M51 52 L74 82 M149 52 L126 82 M51 208 L74 178 M149 208 L126 178"/>'),
    "poire": _svg('<path d="M100 14 C 132 66, 172 120, 172 170 A 72 72 0 0 1 28 170 C 28 120, 68 66, 100 14 Z"/>'
                  '<path d="M100 74 C 118 104, 138 134, 138 168 A 38 38 0 0 1 62 168 C 62 134, 82 104, 100 74 Z"/>'
                  '<path d="M100 14 L100 74 M28 170 L62 168 M172 170 L138 168 M100 242 L100 206"/>'),
    "marquise": _svg('<path d="M100 10 Q 196 130 100 250 Q 4 130 100 10 Z"/><path d="M100 64 Q 148 130 100 196 Q 52 130 100 64 Z"/>'
                     '<path d="M100 10 L100 64 M100 250 L100 196 M52 130 L22 130 M148 130 L178 130"/>'),
    "emeraude": _svg('<polygon points="58,18 142,18 168,44 168,216 142,242 58,242 32,216 32,44"/>'
                     '<polygon points="70,40 130,40 146,56 146,204 130,220 70,220 54,204 54,56"/>'
                     '<polygon points="82,62 118,62 126,70 126,190 118,198 82,198 74,190 74,70"/>'
                     '<path d="M58 18 L70 40 M142 18 L130 40 M168 44 L146 56 M168 216 L146 204 M142 242 L130 220 M58 242 L70 220 M32 216 L54 204 M32 44 L54 56"/>'),
    "coussin": _svg('<rect x="22" y="40" width="156" height="180" rx="52"/><rect x="60" y="84" width="80" height="92" rx="20"/>'
                    '<path d="M38 56 L68 92 M162 56 L132 92 M38 204 L68 168 M162 204 L132 168 M100 40 L100 84 M100 220 L100 176"/>'),
    "radiant": _svg('<polygon points="52,22 148,22 172,46 172,214 148,238 52,238 28,214 28,46"/>'
                    '<polygon points="72,70 128,70 136,78 136,182 128,190 72,190 64,182 64,78"/>'
                    '<path d="M52 22 L72 70 M148 22 L128 70 M172 46 L136 78 M172 214 L136 182 M148 238 L128 190 M52 238 L72 190 M28 214 L64 182 M28 46 L64 78 M100 22 L100 70 M100 238 L100 190"/>'),
    "princesse": _svg('<rect x="22" y="52" width="156" height="156"/><rect x="60" y="90" width="80" height="80"/>'
                      '<path d="M22 52 L178 208 M178 52 L22 208"/>'),
}

# fr name, en name, shot under the cut drawing, shot under the quality line (real footage only if same cut and white)
CUTS = {
    "rond": ("rond", "Round", b(1620766, 0.0, slowmo=True, fx=["kenburns", "glow"]), b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"])),
    "ovale": ("ovale", "Oval", b(1621163, 0.1, slowmo=True, fx=["kenburns", "glow"]), b(1620766, 0.1, slowmo=True, fx=["kenburns", "glow"])),
    "poire": ("poire", "Pear", b(1620766, 0.0, slowmo=True, fx=["kenburns", "glow"]), b(1621163, 0.0, slowmo=True, fx=["kenburns", "glow"])),
    "marquise": ("marquise", "Marquise", b(1620766, 0.0, slowmo=True, fx=["kenburns", "glow"]), b(1657341, 0.1, slowmo=True, fx=["kenburns", "glow"])),
    "emeraude": ("taille émeraude", "Emerald-cut", b(1621163, 0.0, slowmo=True, fx=["kenburns", "glow"]), b(1620766, 0.2, slowmo=True, fx=["kenburns", "glow"])),
    "coussin": ("coussin", "Cushion", b(1620766, 0.2, slowmo=True, fx=["kenburns", "glow"]), b(1621163, 0.1, slowmo=True, fx=["kenburns", "glow"])),
    "radiant": ("radiant", "Radiant", b(1621163, 0.1, slowmo=True, fx=["kenburns", "glow"]), b(1620766, 0.0, slowmo=True, fx=["kenburns", "glow"])),
    "princesse": ("princesse", "Princess", b(1620766, 0.1, slowmo=True, fx=["kenburns", "glow"]), b(1621163, 0.0, slowmo=True, fx=["kenburns", "glow"])),
}

# Rayane shots, rotated per reel so no two reels open or close on the same frames
OPEN = [0.4, 1.0, 1.6, 2.1, 0.7, 1.3, 1.9, 0.2, 1.1, 1.7]
# (middle shot, closing shot): never the same clip twice in one reel; the closing shot is slowed down and must last
# 4 beats + the 5-beat end card, so only Rayane clips of 3 s or more close a reel.
# Allowed Rayane clips only (pro.BANNED refuses b1619751, b1631850, b1630568: ring or stones on a client's finger).
PAIRS = [((1617419, 0.3, False), (1619438, 0.1)), ((1619438, 0.8, False), (1617419, 0.1)),
         ((1631638, 0.0, True), (1619438, 0.2)), ((1617419, 0.6, False), (1619438, 0.1)),
         ((1619438, 1.2, False), (1617419, 0.2)), ((1631638, 0.1, True), (1617419, 0.1))]


def _card(over, svg, text, top):
    return [f'<div class="card pad" style="top:{top}px"><span class="over">{over}</span>{svg}'
            f'<div class="serif s72">{text.replace(" | ", "<br>").replace("|", "<br>")}</div></div>']


def coupe(lang, cut, name, music, i):
    fr = lang == "fr"
    nfr, nen, under_cut, under_quality = CUTS[cut]
    spec = _avis(lang)
    spec["name"] = name
    spec["music"] = music
    mid, close = PAIRS[i % len(PAIRS)]
    spec["shots"] = [
        dict(shot=b(1620314, OPEN[i % len(OPEN)], fx=["kenburns"]), beats=5, tr="cut"),     # Rayane: model + price
        dict(shot=under_cut, beats=3, tr="smoothleft"),                                     # the cut, drawn
        dict(shot=under_quality, beats=3, tr="fadewhite"),                                  # quality line
        dict(shot=b(mid[0], mid[1], slowmo=mid[2], fx=["kenburns"]), beats=3, tr="fade"),   # Rayane: metal
        dict(shot=b(close[0], close[1], slowmo=True, fx=["kenburns"]), beats=4),            # Rayane: review + end card
    ]
    if fr:
        # a long cut name (« taille émeraude ») overflowed the card (QC 15 Nov): carat goes to the second line
        hook = (f"Solitaire {nfr} 2 carats | 2 300 à 2 400&nbsp;$" if len(nfr) <= 10
                else f"Solitaire {nfr} | 2 carats · 2 300 à 2 400&nbsp;$")
        stone = f"Diamant {nfr} | de laboratoire"
        lines = [("Couleur E · pureté VVS2 | Certificat IGI.", "Qualité", 300),
                 ("Or blanc 18k. | Design 3D en 48 h.", "Monture", 1000),
                 ("«&nbsp;Prix super abordable | comparé aux compétiteurs.&nbsp;»", "Avis Google", 300)]
        over_hook, over_cut = "Prix indicatif · + taxes", "Pierre centrale"
    else:
        hook = f"{nen} solitaire, 2 carats | $2,300–2,400 CAD"
        stone = f"{nen} | lab-grown diamond"
        lines = [("E color · VVS2 clarity | IGI certified.", "Quality", 300),
                 ("18k white gold. | 3D design in 48 h.", "Setting", 1000),
                 ("“The best | in the business.”", "Google review", 300)]
        over_hook, over_cut = "Estimated price · plus tax", "Center stone"
    size = "s86" if len(hook) < 44 else "s72"
    spec["texts"] = [dict(html=pro.card_words(hook, over=over_hook, size=size, top=820)[-1:], at=0, until=5),
                     dict(html=_card(over_cut, SVG[cut], stone, 640), at=5, until=8)]
    for (x, o, top), (a, u) in zip(lines, [(8, 11), (11, 14), (14, 18)]):
        spec["texts"].append(dict(html=pro.card_words(x, over=o, size="s72", top=top), at=a, until=u))
    return spec


PLAN = [  # (function name, lang, cut, music)
    ("C_rond", "fr", "rond", "664"), ("C_ovale", "fr", "ovale", "43"), ("C_poire", "fr", "poire", "460"),
    ("C_marquise", "fr", "marquise", "501"), ("C_emeraude", "fr", "emeraude", "601"), ("C_coussin", "fr", "coussin", "349"),
    ("C_radiant", "fr", "radiant", "711"), ("C_princesse", "fr", "princesse", "1106"),
    ("C_EN_round", "en", "rond", "480"), ("C_EN_oval", "en", "ovale", "1210"), ("C_EN_marquise", "en", "marquise", "683"),
    ("C_EN_emerald", "en", "emeraude", "227"),
]
for _i, (_n, _l, _c, _m) in enumerate(PLAN):
    REELS[_n] = (lambda l=_l, c=_c, n=_n, m=_m, i=_i: coupe(l, c, n, m, i))


@reel
def C_toutes_coupes():
    """All eight cuts in one reel, one drawing per beat and a half, ending on a question that makes people comment."""
    spec = _avis("fr")
    spec["name"] = "C_toutes_coupes"
    spec["music"] = "1028"
    spec["shots"] = [
        dict(shot=b(1620314, 0.9, fx=["kenburns"]), beats=4, tr="cut"),
        dict(shot=b(1620766, 0.0, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=b(1617419, 0.2, fx=["kenburns"]), beats=4, tr="fade"),
        dict(shot=b(1621163, 0.0, slowmo=True, fx=["kenburns", "glow"]), beats=4, tr="fadewhite"),
        dict(shot=b(1619438, 0.1, slowmo=True, fx=["kenburns"]), beats=4),
    ]
    texts = [dict(html=pro.card_words("Solitaire 2 carats | 2 300 à 2 400&nbsp;$", over="Diamant de labo · or blanc 18k · + taxes",
                                      size="s86", top=820)[-1:], at=0, until=4)]
    order = ["rond", "ovale", "poire", "marquise", "emeraude", "coussin", "radiant", "princesse"]
    for k, cut in enumerate(order):
        texts.append(dict(html=_card("Dans la coupe de ton choix", SVG[cut], CUTS[cut][0].capitalize(), 640),
                          at=4 + k * 1.5, until=4 + (k + 1) * 1.5))
    texts.append(dict(html=pro.card_words("Laquelle | tu choisis&nbsp;?", size="s86", top=640), at=16, until=20))
    spec["texts"] = texts
    return spec


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
