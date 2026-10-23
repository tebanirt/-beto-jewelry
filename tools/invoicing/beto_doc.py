"""
Generateur de documents Beto Jewelry (Recu / Facture / Soumission).

Reproduit le gabarit officiel confirme par Rayane (Beto-Jewelry_Recu-depot_Maxim-Huard.pdf,
20 oct. 2026) : bandeau titre, teinte or/bronze, mise en page a deux colonnes, tableau,
bandeau creme pour le solde, etapes suivantes, pied de page avec les coordonnees de
Rayane uniquement (jamais celles de Lorraine/autre employe).

IMPORTANT (ne jamais changer sans instruction explicite de Rayane) :
- Le logo officiel doit vivre dans assets/logo.png (ou .svg) a cote de ce fichier.
  Tant qu'il n'y est pas, header() dessine un monogramme de remplacement ET imprime
  un avertissement sur stderr -- ne jamais livrer un document a un client avec ce
  monogramme de remplacement sans le signaler.
- Palette, mise en page, numerotation (BJ-AAAA-MMJJ facture/soumission, REC-AAAA-MMJJ
  recu) : fixes par le gabarit de Maxime. Ne pas modifier sans confirmation explicite.
"""
import os
import sys

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfgen import canvas

GOLD = colors.HexColor("#AD8A4D")
INK = colors.HexColor("#1A1A1A")
GRAY = colors.HexColor("#6B6B6B")
CREAM = colors.HexColor("#F4EEE3")
RULE = colors.HexColor("#D9D2C4")

W, H = LETTER
MARGIN = 0.78 * inch
X0 = MARGIN
X1 = W - MARGIN

ASSETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
LOGO_PNG = os.path.join(ASSETS_DIR, "logo.png")


def spaced(text, gap=" "):
    return gap.join(list(text))


def _draw_placeholder_mark(c, x, y):
    c.saveState()
    c.setStrokeColor(GOLD)
    c.setFillColor(GOLD)
    c.setLineWidth(1.1)
    cx, cy, r = x + 11, y + 11, 11
    c.line(cx, cy + r, cx + r, cy)
    c.line(cx + r, cy, cx, cy - r)
    c.line(cx, cy - r, cx - r, cy)
    c.line(cx - r, cy, cx, cy + r)
    c.setFont("Times-Bold", 13)
    c.setFillColor(INK)
    c.drawCentredString(cx, cy - 4.5, "B")
    c.restoreState()


LOGO_HEIGHT = 24
LOGO_ASPECT = 1710 / 953  # largeur / hauteur du fichier logo.png fourni par Rayane


def draw_logo_mark(c, x, y):
    if os.path.isfile(LOGO_PNG):
        w = LOGO_HEIGHT * LOGO_ASPECT
        c.drawImage(LOGO_PNG, x, y, width=w, height=LOGO_HEIGHT, mask="auto", preserveAspectRatio=True)
        return w
    else:
        print(
            f"[beto_doc] ATTENTION: logo officiel introuvable ({LOGO_PNG}). "
            "Monogramme de remplacement utilisé — NE PAS envoyer ce document à un "
            "client sans en avertir Rayane.",
            file=sys.stderr,
        )
        _draw_placeholder_mark(c, x, y)
        return 22


def header(c, doc_label, y):
    logo_w = draw_logo_mark(c, X0, y - 24)
    text_x = X0 + logo_w + 12
    c.setFont("Times-Roman", 15)
    c.setFillColor(INK)
    c.drawString(text_x, y - 10, spaced("BETO JEWELRY"))
    c.setFont("Helvetica", 6.6)
    c.setFillColor(GOLD)
    c.drawString(text_x, y - 21, spaced("JOAILLERIE SUR MESURE"))

    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(GOLD)
    c.drawRightString(X1, y - 9, spaced(doc_label))
    c.setFont("Helvetica", 6.6)
    c.setFillColor(GRAY)
    c.drawRightString(X1, y - 20, spaced("MONTRÉAL · SUR MESURE"))

    c.setStrokeColor(GOLD)
    c.setLineWidth(1)
    c.line(X0, y - 32, X1, y - 32)
    return y - 60


def title(c, text, y):
    c.setFont("Times-Roman", 27)
    c.setFillColor(INK)
    c.drawString(X0, y, text)
    return y - 34


def label_value(c, x, y, label, value, value_font="Times-Roman", value_size=10.2):
    c.setFont("Helvetica-Bold", 7.2)
    c.setFillColor(GOLD)
    c.drawString(x, y, spaced(label))
    c.setFont(value_font, value_size)
    c.setFillColor(INK)
    c.drawString(x, y - 13, value)


def meta_block(c, left_rows, right_rows, y):
    """left_rows / right_rows: list of (label, value)"""
    ly = y
    for lbl, val in left_rows:
        label_value(c, X0, ly, lbl, val)
        ly -= 30
    ry = y
    rx = X0 + (X1 - X0) * 0.56
    for lbl, val in right_rows:
        label_value(c, rx, ry, lbl, val)
        ry -= 30
    return min(ly, ry) - 6


def table_header(c, y, cols=("DESCRIPTION", "MONTANT")):
    c.setFont("Helvetica-Bold", 7.4)
    c.setFillColor(GOLD)
    c.drawString(X0, y, cols[0])
    c.drawRightString(X1, y, cols[1])
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(X0, y - 7, X1, y - 7)
    return y - 24


def line_item(c, y, title_text, montant, description=None):
    c.setFont("Times-Bold", 11)
    c.setFillColor(INK)
    c.drawString(X0, y, title_text)
    c.drawRightString(X1, y, montant)
    y -= 15
    if description:
        c.setFont("Helvetica", 8.3)
        c.setFillColor(GRAY)
        for line in description:
            c.drawString(X0, y, line)
            y -= 11
    return y - 6


def amount_banner(c, y, label, amount, tag=None):
    c.setFont("Helvetica-Bold", 7.6)
    c.setFillColor(GRAY)
    c.drawRightString(X1 - 2, y, spaced(label))
    c.setFont("Times-Bold", 17)
    c.setFillColor(INK)
    c.drawRightString(X1, y - 20, amount)
    if tag:
        c.setFont("Helvetica-Bold", 7.4)
        c.setFillColor(GOLD)
        c.drawRightString(X1, y - 31, spaced(tag))
        return y - 46
    return y - 36


def summary_section(c, y, heading, rows, total_row):
    """rows: list of (label, amount_str); total_row: (label, amount_str)"""
    c.setFont("Times-Roman", 14.5)
    c.setFillColor(INK)
    c.drawString(X0, y, heading)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(X0, y - 5, X0 + 120, y - 5)
    y -= 26
    c.setFont("Times-Roman", 9.6)
    for lbl, amt in rows:
        c.setFillColor(INK)
        c.drawString(X0 + 6, y, lbl)
        c.drawRightString(X1, y, amt)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(X0, y - 9, X1, y - 9)
        y -= 24
    band_h = 26
    c.setFillColor(CREAM)
    c.rect(X0, y - band_h + 10, X1 - X0, band_h, stroke=0, fill=1)
    c.setFont("Helvetica-Bold", 8.6)
    c.setFillColor(INK)
    c.drawString(X0 + 6, y, total_row[0])
    c.setFont("Times-Bold", 13)
    c.drawRightString(X1 - 4, y, total_row[1])
    return y - 36


def legal_note(c, y, text_lines):
    c.setFont("Helvetica", 7.6)
    c.setFillColor(GRAY)
    for line in text_lines:
        c.drawString(X0, y, line)
        y -= 10
    return y - 14


def next_steps(c, y, steps):
    """steps: list of (num:str, title:str, desc:str)"""
    c.setFont("Times-Roman", 13.5)
    c.setFillColor(INK)
    c.drawString(X0, y, "Prochaines étapes")
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(X0, y - 5, X0 + 150, y - 5)
    y -= 24
    for num, stitle, sdesc in steps:
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
    return y


def thanks(c, y, text="Merci pour votre confiance."):
    c.setFont("Times-Italic", 10.5)
    c.setFillColor(INK)
    c.drawCentredString(W / 2, y, text)
    return y - 30


def footer(c, page_label="PAGE 1"):
    y = 0.6 * inch
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(X0, y + 14, X1, y + 14)
    c.setFont("Helvetica", 7)
    c.setFillColor(GRAY)
    c.drawString(X0, y, spaced("RAYANE TEBANI · 438-874-5759 · BETOJEWLZ@GMAIL.COM · MONTRÉAL"))
    c.drawRightString(X1, y, page_label)


def new_canvas(path):
    return canvas.Canvas(path, pagesize=LETTER)
