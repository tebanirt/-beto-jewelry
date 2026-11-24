"""Instagram carousels (1080 x 1350) built on the schema bank. Carousels earn saves and show up again in the feed;
the drawings are illustrations, every fact is standard gemology vocabulary or from the business brief.

    python3 carrousels.py <svgRoot> <outRoot> <fontsDir> <logo.png> [name ...]
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

FORMES = [
    ("rond", "Rond", "La taille brillant ronde est pensée pour renvoyer un maximum de lumière."),
    ("ovale", "Ovale", "Allongée, elle donne l'impression d'un doigt plus long."),
    ("coussin", "Coussin", "Un carré aux coins arrondis, au charme vintage."),
    ("princesse", "Princesse", "Carrée, aux coins vifs, avec une taille brillante."),
    ("emeraude", "Émeraude", "Une taille à degrés : de grands reflets, comme une galerie de miroirs."),
    ("asscher", "Asscher", "L'émeraude en version carrée, aux coins coupés."),
    ("radiant", "Radiant", "Coins coupés et taille brillante : l'éclat d'un rond dans un rectangle."),
    ("poire", "Poire", "Une goutte d'eau : ronde d'un côté, en pointe de l'autre."),
    ("marquise", "Marquise", "En pointe aux deux bouts. À poids égal, l'une des formes qui paraissent les plus grandes."),
    ("coeur", "Cœur", "Le symbole par excellence. Il demande une taille très symétrique."),
]

# Approximate diameters of well-cut round brilliants (same table as schemas.CARAT_MM). Always "environ".
CARATS = [(1.0, "1 carat", "6,5"), (1.5, "1,5 carat", "7,4"), (2.0, "2 carats", "8,2"),
          (2.5, "2,5 carats", "8,8"), (3.0, "3 carats", "9,3"), (4.0, "4 carats", "10,2")]
ECHELLE = "Illustration à l'échelle · diamètre moyen d'un rond bien taillé, il varie d'une pierre à l'autre"

def spec_formes(svg):
    slides = [dict(kind="cover", kicker="Le guide des formes", svg=f"{svg}/or/forme_rond.svg",
                   title="10 formes<br>de diamant", text="Laquelle est la tienne ?")]
    # Instagram takes 10 images at most per carousel: two shapes per image
    for k in range(0, len(FORMES), 2):
        items = [dict(svg=f"{svg}/ivoire/forme_{f}.svg", title=name, text=text) for f, name, text in FORMES[k:k + 2]]
        slides.append(dict(kind="pair", kicker=f"{k + 1:02d} — {k + 2:02d} / {len(FORMES)}", items=items))
    slides.append(dict(kind="end", svg=f"{svg}/or/forme_ovale.svg", title="La forme de ton choix",
                       text="Design 3D en 48 h, bague prête en 2 semaines.<br>Créée sur mesure à Montréal."))
    return dict(slides=slides)


def spec_carats(svg):
    f = lambda ct: f"{svg}/ivoire/carat_{round(ct * 100):03d}.svg"
    slides = [dict(kind="cover", kicker="Le guide des carats", svg=f"{svg}/or/carat_200.svg",
                   title="2 carats,<br>2 fois plus gros ?", text="Pas vraiment. Voici les vraies tailles.")]
    for k in range(0, len(CARATS), 2):
        items = [dict(svg=f(ct), title=name, text=f"environ {mm} mm") for ct, name, mm in CARATS[k:k + 2]]
        slides.append(dict(kind="pair", kicker="Vu de dessus, à la même échelle", items=items, small=ECHELLE))
    slides.append(dict(kind="pair", kicker="1 carat contre 2 carats", small=ECHELLE, items=[
        dict(svg=f(1.0), title="1 carat", text="environ 6,5 mm"),
        dict(svg=f"{svg}/or/carat_200.svg", color=None, title="2 carats", text="environ 8,2 mm")]))
    slides.append(dict(kind="fact", kicker="Pourquoi ?", title="Le poids double,<br>le diamètre<br>gagne environ 26 %", top=330, texttop=780,
                       text="Le carat est un poids : 1 carat = 0,2 gramme.<br>Ce poids se répartit aussi en profondeur,<br>"
                            "pas seulement sur le dessus de la pierre."))
    slides.append(dict(kind="fact", kicker="Bon à savoir", title="Dès 1 carat,<br>un certificat IGI", top=400, texttop=720,
                       text="Nos bagues de fiançailles commencent à 1 carat,<br>"
                            "et la pierre centrale est accompagnée<br>de son certificat IGI."))
    slides.append(dict(kind="end", svg=f"{svg}/or/carat_150.svg", title="Le carat de ton choix",
                       text="Design 3D en 48 h, bague prête en 2 semaines.<br>Créée sur mesure à Montréal."))
    return dict(slides=slides)


# The "styles" carousel was removed on 23 Nov. 2026: Rayane refused the ring drawings. Rings come back only as real
# photos or realistic renders.
SPECS = dict(formes=spec_formes, carats=spec_carats)

if __name__ == "__main__":
    svg, out, fonts, logo = sys.argv[1:5]
    names = sys.argv[5:] or list(SPECS)
    for n in names:
        sp = SPECS[n](svg)
        os.makedirs(f"{out}/{n}", exist_ok=True)
        jp = f"{out}/{n}/spec.json"
        json.dump(sp, open(jp, "w"), ensure_ascii=False)
        subprocess.run(["node", f"{HERE}/carrousel.js", fonts, jp, f"{out}/{n}", logo], check=True)
