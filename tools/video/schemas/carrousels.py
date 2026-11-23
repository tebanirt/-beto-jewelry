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

STYLES = [
    ("bague_dessus_solitaire", "Solitaire", "Une seule pierre, quatre griffes. Tout le regard va au diamant."),
    ("bague_dessus_halo", "Halo", "Un cercle de petits diamants autour de la pierre : elle paraît plus grande."),
    ("bague_profil_hidden-halo", "Halo caché", "Les petits diamants sont sous la pierre. De dessus, on voit un solitaire ; de côté, la surprise."),
    ("bague_profil_cathedrale", "Cathédrale", "L'anneau monte en arches jusqu'à la pierre, comme une voûte."),
    ("bague_dessus_demi-eternite", "Demi-éternité", "Des petits diamants sur le dessus de l'anneau, là où ils se voient."),
]


def spec_formes(svg):
    slides = [dict(kind="cover", kicker="Le guide des formes", svg=f"{svg}/or/forme_rond.svg",
                   title="10 formes<br>de diamant", text="Laquelle est la tienne ?")]
    for f, name, text in FORMES:
        slides.append(dict(kind="item", svg=f"{svg}/ivoire/forme_{f}.svg", title=name, text=text))
    slides.append(dict(kind="end", svg=f"{svg}/or/forme_ovale.svg", title="La forme de ton choix",
                       text="Design 3D en 48 h, bague prête en 2 semaines.<br>Créée sur mesure à Montréal."))
    return dict(slides=slides)


def spec_styles(svg):
    slides = [dict(kind="cover", kicker="Le guide des styles", svg=f"{svg}/or/bague_dessus_halo.svg",
                   title="Solitaire, halo<br>ou halo caché ?", text="5 styles, expliqués en dessins.")]
    for f, name, text in STYLES:
        slides.append(dict(kind="item", svg=f"{svg}/ivoire/{f}.svg", title=name, text=text, artw=760))
    slides.append(dict(kind="end", title="Tu hésites entre deux ?",
                       text="On en parle ensemble : design 3D en 48 h,<br>révisions incluses."))
    return dict(slides=slides)


SPECS = dict(formes=spec_formes, styles=spec_styles)

if __name__ == "__main__":
    svg, out, fonts, logo = sys.argv[1:5]
    names = sys.argv[5:] or list(SPECS)
    for n in names:
        sp = SPECS[n](svg)
        os.makedirs(f"{out}/{n}", exist_ok=True)
        jp = f"{out}/{n}/spec.json"
        json.dump(sp, open(jp, "w"), ensure_ascii=False)
        subprocess.run(["node", f"{HERE}/carrousel.js", fonts, jp, f"{out}/{n}", logo], check=True)
