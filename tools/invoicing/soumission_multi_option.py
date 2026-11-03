"""
Gabarit de soumission a options multiples + references visuelles.

Confirme par Rayane le 27 oct. 2026 (premiere utilisation : soumission Amanda,
bague cathedrale 14k/18k). A reutiliser pour toute soumission presentant
plusieurs options de prix (ex. carats de metal differents) accompagnee de
photos de reference (modele souhaite, details de style).

Construit sur le gabarit officiel (beto_doc.py) -- meme palette, meme
typographie, memes regles (logo reel uniquement, jamais envoye sans
confirmation explicite de Rayane).

Usage minimal :

    from soumission_multi_option import make_multi_option_quote

    make_multi_option_quote(
        out_path="Soumission_Client.pdf",
        lang="fr",                      # ou "en"
        client_name="Amanda",
        doc_number="BJ-2026-1027",
        date_str="27 octobre 2026",
        reference="Bague cathédrale sur mesure",
        options=[
            {"title": "Option — Or jaune 14 carats", "amount": "2 350 $",
             "description": ["Style cathédrale, hidden halo, pierres latérales",
                              "Pierre centrale : 3,00 ct, qualité EVVS2"]},
            {"title": "Option — Or jaune 18 carats", "amount": "2 750 $",
             "description": ["Style cathédrale, hidden halo, pierres latérales",
                              "Pierre centrale : 3,00 ct, qualité EVVS2"]},
        ],
        inclusions=[
            ("01", "Gravure incluse", "Un message ou des initiales, sans frais."),
            ("02", "Mise à grandeur gratuite", "Pour le futur, à vie."),
        ],
        reference_images=[
            ("/chemin/vers/photo1.png", "Modèle souhaité — vue de face"),
            ("/chemin/vers/photo2.png", "Modèle souhaité — vue de profil"),
        ],
    )

Les options et inclusions sont des listes libres (1 a N elements) -- ce
gabarit n'est pas fige a 2 options ou 4 inclusions. Les images de reference
sont placees automatiquement, 2 par rangee, avec legende.
"""
import sys

sys.path.insert(0, "/home/user/-beto-jewelry/tools/invoicing")
from beto_doc import (  # noqa: E402
    new_canvas, header, title, meta_block, table_header, line_item,
    legal_note, thanks, footer, X0, X1, W, H, GOLD, INK, GRAY,
)

_LABELS = {
    "fr": {
        "doc_label": "SOUMISSION",
        "title": "Soumission",
        "prepared_for": "PRÉPARÉE POUR",
        "reference": "RÉFÉRENCE",
        "number": "NUMÉRO",
        "date": "DATE",
        "cols": ("DESCRIPTION", "MONTANT"),
        "included": "Ce qui est inclus",
        "refs_title": "Références visuelles",
        "thanks": "Merci pour votre confiance.",
        "legal_default": [
            "Prix avant taxes; les taxes applicables seront ajoutées, le cas échéant. Soumission valide 30 jours.",
            "Un dépôt de 200 $ (entièrement crédité sur le prix final) est requis pour lancer le design 3D.",
        ],
    },
    "en": {
        "doc_label": "QUOTE",
        "title": "Quote",
        "prepared_for": "PREPARED FOR",
        "reference": "REFERENCE",
        "number": "NUMBER",
        "date": "DATE",
        "cols": ("DESCRIPTION", "AMOUNT"),
        "included": "What's included",
        "refs_title": "Visual references",
        "thanks": "Thank you for your trust.",
        "legal_default": [
            "Prices before tax; applicable taxes will be added where relevant. Quote valid for 30 days.",
            "A $200 deposit (fully credited toward the final price) is required to begin the 3D design.",
        ],
    },
}


def make_multi_option_quote(
    out_path,
    client_name,
    doc_number,
    date_str,
    reference,
    options,
    inclusions,
    reference_images=None,
    lang="fr",
    legal_lines=None,
    title_text=None,
    thanks_text=None,
):
    """Genere un PDF de soumission a options multiples + references visuelles.

    options: liste de {"title": str, "amount": str, "description": [str, ...]}
    inclusions: liste de (numero:str, titre:str, description:str)
    reference_images: liste de (chemin_fichier, legende) -- optionnel, 2 par rangee
    lang: "fr" ou "en"
    """
    L = _LABELS[lang]
    legal_lines = legal_lines or L["legal_default"]

    c = new_canvas(out_path)

    # ---------- Page 1 : soumission ----------
    y = H - 0.75 * 72
    y = header(c, L["doc_label"], y)
    y = title(c, title_text or L["title"], y)
    y = meta_block(
        c,
        left_rows=[(L["prepared_for"], client_name), (L["reference"], reference)],
        right_rows=[(L["number"], doc_number), (L["date"], date_str)],
        y=y,
    )
    y -= 8
    y = table_header(c, y, cols=L["cols"])
    for i, opt in enumerate(options):
        y = line_item(c, y, opt["title"], opt["amount"], description=opt.get("description"))
        if i < len(options) - 1:
            y -= 4
    y -= 10

    c.setFont("Times-Roman", 13.5)
    c.setFillColor(INK)
    c.drawString(X0, y, L["included"])
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(X0, y - 5, X0 + 150, y - 5)
    y -= 24
    for num, stitle, sdesc in inclusions:
        c.setFont("Helvetica-Bold", 8.2)
        c.setFillColor(GOLD)
        c.drawString(X0, y, num)
        c.setFont("Times-Bold", 10)
        c.setFillColor(INK)
        c.drawString(X0 + 24, y, stitle)
        c.setFont("Helvetica", 8.3)
        c.setFillColor(GRAY)
        c.drawString(X0 + 24, y - 12, sdesc)
        y -= 32

    y -= 6
    y = legal_note(c, y, legal_lines)
    thanks(c, y, text=thanks_text or L["thanks"])
    footer(c, "PAGE 1")

    # ---------- Page 2 : references visuelles (si fournies) ----------
    if reference_images:
        c.showPage()
        y2 = H - 0.75 * 72
        y2 = header(c, L["doc_label"], y2)

        c.setFont("Times-Roman", 16)
        c.setFillColor(INK)
        c.drawString(X0, y2, L["refs_title"])
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.8)
        c.line(X0, y2 - 7, X0 + 150, y2 - 7)
        y2 -= 36

        from PIL import Image

        row = []
        for path, caption in reference_images:
            row.append((path, caption))
            if len(row) == 2:
                y2 = _draw_image_row(c, row, y2)
                row = []
        if row:
            y2 = _draw_image_row(c, row, y2)

        footer(c, "PAGE 2")

    c.showPage()
    c.save()
    return out_path


def _draw_image_row(c, row, y, target_h=230, gap=24):
    """Dessine 1 ou 2 images centrees sur une rangee, legendees. Retourne le nouveau y."""
    from PIL import Image

    widths = []
    for path, _ in row:
        with Image.open(path) as im:
            iw, ih = im.size
        widths.append(target_h * (iw / ih))

    total_w = sum(widths) + gap * (len(row) - 1)
    x = X0 + (X1 - X0 - total_w) / 2
    img_top = y
    for (path, caption), w in zip(row, widths):
        c.drawImage(path, x, img_top - target_h, width=w, height=target_h,
                    mask="auto", preserveAspectRatio=True)
        c.setFont("Helvetica", 8)
        c.setFillColor(GRAY)
        c.drawCentredString(x + w / 2, img_top - target_h - 14, caption)
        x += w + gap

    return img_top - target_h - 14 - 46
