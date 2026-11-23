"""Holiday paid ads (Rayane, 21 Nov 2026: « prépare-moi toutes les pubs optimisées… pour Noël »).

Prices are HOLIDAY prices given by Rayane (FAITS.md). Wording rules (DONNEES.md §33): never « rabais », « au lieu de »
or a crossed-out price while no higher regular price has actually been charged; the label below says what the offer is
and until when. Every ring shows only its own price; the collection card names each piece next to its price.
The set (marquise in yellow gold + its pavé band) and the wide band: carat, gold and stone type not confirmed, so they
are described without « diamant » (never imply natural) and without a carat.
Usage: reels_fetes.py NAME [NAME ...]"""
import sys
import pro
from reels_jobby_v2 import shots
from reels_jobby_tr import sub, SH, L
from reels_multi import RINGS, ring_card
from reelkit import S

# the group picture sits higher here than in reels_new (y 400), so the price list stays above Instagram's bottom bar
CBOX = (190, 400, 700, 569)   # 700 x 569 keeps the 2160 x 1756 crop of the group shot (whole rings, nothing cut)
CFRAME = (f'<div style="position:absolute;left:{CBOX[0] - 2}px;top:{CBOX[1] - 2}px;width:{CBOX[2]}px;height:{CBOX[3]}px;'
          'border:2px solid rgba(201,168,106,.55)"></div>')


def group(t):
    return S("u:QUATRE66.mp4", t, 1, zoom=1.0, cx=1080, cy=1950, fx=[], box=CBOX + ("#0F0E0C",))

HOLIDAY = None   # no « Prix des Fêtes »: it implies a discount from a regular price never charged (DONNEES.md §33)
DEADLINE = "Commandez avant le 11 décembre"   # approved copy (brief §6)

BENNY, JOBBY = RINGS
SET = ("Ensemble", "4 000", "Marquise · avec son jonc", "L'ensemble, jonc pavé compris", "Diamants de laboratoire · or jaune",
       (("DUO68W", 1.5), ("DUO67W", 2.5)))

# the collection, cheapest first; the band has no solo shot, so it is only ever priced on the group picture
COLLECTION = [("Jonc large · or blanc 14k", "2 200"), ("Marquise 2 ct · or blanc", "2 600"),
              ("Marquise 4 ct · tête florale", "3 350"), ("Marquise et son jonc · or jaune", "4 000")]


def card(ring, top=278):
    """ring_card inside Meta's Reels safe zone (top 14 % = 269 px free); the true deadline on the « + taxes » line."""
    _, price, over, detail, spec, _ = ring
    html = ring_card(price, over, detail, spec, top)
    return [h.replace(">+ taxes</div>", ">+ taxes · avant le 11 déc.</div>") for h in html]


def end_card(shade_a=.74, credit=False):
    """The two ways to start, then the deadline. Credit words only with credit=True, and then only « Possibilité de crédit »
    (one of the mentions the LPC regulation allows in a product ad; never a rate, an instalment or « payez plus tard »)."""
    shade = f'<div style="position:absolute;inset:0;background:rgba(8,8,8,{shade_a})"></div>'
    logo = '<img class="logo" style="top:520px;width:250px;filter:invert(1)" src="%LOGO%">'
    head = sub("Deux façons de commencer", 720)
    o1 = (f'<div class="ctr serif" style="top:790px;font-size:58px;color:#F6F3EE;{SH}">1. Commence ton <i>design</i></div>'
          f'<div class="ctr" style="top:870px;font-family:Jost;font-size:30px;color:#E9E3D8;{SH}">Dépôt de 250 $ + taxes, crédité à 100 %</div>')
    o2 = (f'<div class="ctr serif" style="top:960px;font-size:58px;color:#F6F3EE;{SH}">2. Consultation <i>gratuite</i></div>'
          f'<div class="ctr" style="top:1040px;font-family:Jost;font-size:30px;color:#E9E3D8;{SH}">Essaie les tailles de pierre · Montréal ou en vidéo</div>')
    o3 = (f'<div class="lxr" style="top:1130px"></div>'
          f'<div class="ctr" style="top:1160px;font-family:Jost;font-weight:500;font-size:30px;letter-spacing:.06em;color:#DABD86;{SH}">{DEADLINE}</div>'
          + (f'<div class="ctr" style="top:1206px;font-family:Jost;font-size:28px;color:#E9E3D8;{SH}">Possibilité de crédit</div>'
             if credit else ""))
    return [shade + logo, shade + logo + head + o1, shade + logo + head + o1 + o2, shade + logo + head + o1 + o2 + o3]


def single(ring, name, music="228"):
    """One ring, about 15 s: its price from the first frame, then the end card."""
    _, *_, (front, det) = ring
    seq = [(front, 3), (det, 3), ((front[0], front[1] + 5.0), 8)]   # a later moment of the same turn, never a rewind
    texts = [dict(html=card(ring), at=0, until=6, every=2),
             dict(html=end_card(), at=6, until=14, every=1.2, min_s=8)]
    return dict(name=name, music=music, shots=shots(*seq), texts=texts, end=dict(beats=0, overlay=True, layers={}))


ROSE = ("ROSE72W", 0.8), ("ROSE73W", 0.5)   # C072 front turn, C073 back view (the floral basket), 22 Nov 2026


def rose_card(top=278, price=None):
    """Léo's ring (CRM, 4 Nov 2026): cathedral solitaire, floral head, 3 ct round lab-grown Vivid Pink, 14k yellow gold.
    No price unless Rayane confirms one for ads: 2 800 $ was its Marketplace price, before the company (orders.entite)."""
    big = (f'<div class="lx lxp" style="top:{top + 40}px">{price}<span class="cur">$</span></div>'
           f'<div class="lx lxt" style="top:{top + 188}px">+ taxes · avant le 11 déc.</div>') if price else \
          (f'<div class="lx lxh" style="top:{top + 48}px;font-size:80px">Diamant <i>rose vif</i></div>'
           f'<div class="lx lxt" style="top:{top + 188}px">Diamant de laboratoire</div>')
    head = '<div class="lxs"></div>' + f'<div class="lx lxo" style="top:{top}px">Solitaire rond · 3 carats</div>' + big
    why = (f'<div class="lxr" style="top:{top + 234}px"></div>'
           f'<div class="lx lxi" style="top:{top + 250}px">Une tête florale sous la pierre</div>'
           f'<div class="lx lxd" style="top:{top + 314}px">Or jaune 14k · fait sur mesure à Montréal</div>')
    return [head, head + why]


def AD_rose(price=None):
    """The pink round next to the white marquises (Rayane, 22 Nov 2026: « ça va faire un beau contraste »), ~15 s:
    the front of the stone, the floral head from behind, the front again under the two ways to start."""
    front, back = ROSE
    seq = [(front, 3), (back, 3), ((front[0], front[1] + 5.0), 8)]
    texts = [dict(html=rose_card(price=price), at=0, until=6, every=2),
             dict(html=end_card(), at=6, until=14, every=1.2, min_s=8)]
    return dict(name="AD_fetes_rose" + ("_prix" if price else ""), music="228", shots=shots(*seq), texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


def collection_card():
    """The four pieces on the framed group picture, each named next to its own price, revealed line by line."""
    head = (f'<div class="lx lxo" style="top:226px">{DEADLINE}</div>'
            f'<div class="lx lxh" style="top:290px;font-size:76px">Nos dernières <i>bagues</i></div>')
    stages, rows = [CFRAME + head], ""
    for k, (name, price) in enumerate(COLLECTION):
        y = 1000 + k * 54
        rows += (f'<div style="position:absolute;left:150px;right:150px;top:{y}px;display:flex;justify-content:space-between;'
                 f'align-items:baseline;color:#F6F3EE;{SH}"><span style="font-family:Jost;font-size:31px;letter-spacing:.02em">{name}</span>'
                 f'<span style="font-family:Bodoni;font-weight:500;font-size:42px">{price}<span style="font-size:.6em"> $</span></span></div>')
        stages.append(CFRAME + head + rows)
    stages[-1] += f'<div class="lx lxt" style="top:1222px">Prix + taxes</div>'
    return stages


def AD_collection():
    sh = shots((("JOBBY3W", 0.4), 10), (("JOBBY3W", 20.3), 8))
    sh[0]["shot"] = group(0.4)
    texts = [dict(html=collection_card(), at=0, until=10, every=1.3, min_s=7.5),
             dict(html=end_card(), at=10, until=18, every=1.2, min_s=8)]
    return dict(name="AD_fetes_collection", music="228", shots=sh, texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


PANEL = '<div style="position:absolute;left:0;right:0;top:262px;height:300px;background:rgba(15,14,12,.84)"></div>'


def quote(text, top=300):
    """A verbatim Google review (FAITS.md), never reworded, in the site fonts, in the upper safe zone (y 269 to 1248),
    on a dark band: the consultation shots have a white wall behind Rayane, where white text would not read."""
    return [PANEL +
            f'<div class="lx lxo" style="top:{top}px">Avis Google · 5 étoiles</div>'
            f'<div class="lx lxi" style="top:{top + 44}px;font-size:58px;left:80px;right:80px">« {text} »</div>']


def AD_avis():
    """Trust ad for warm audiences: the only organic format that beat the 72 h bar (Rayane + verbatim Google reviews),
    re-styled in the site fonts. Rayane's face first (founder-led), two real reviews, then the end card. About 23 s."""
    from reels_native import b
    sh = [dict(shot=b(1620314, 1.6, fx=[]), beats=4, tr="cut"),
          dict(shot=b(1619438, 1.0, fx=[]), beats=3, tr="cut"),
          dict(shot=b(1617419, 2.0, fx=[]), beats=3, tr="cut"),
          dict(shot=L("BENNY42W", 1.0), beats=8)]
    hook = [PANEL + '<div class="lx lxo" style="top:290px">Rayane · joaillier diplômé</div>'
            '<div class="lx lxh" style="top:336px;font-size:68px">Plus de 500 créations.<br><i>Voici ce qu’en disent mes clients.</i></div>']
    texts = [dict(html=hook, at=0, until=4),
             dict(html=quote("Je suis absolument en amour avec ma bague !"), at=4, until=7),
             dict(html=quote("Rayane très professionnel et courtois."), at=7, until=10),
             dict(html=end_card(), at=10, until=18, every=1.2, min_s=8)]
    return dict(name="AD_fetes_avis", music="738", shots=sh, texts=texts, end=dict(beats=0, overlay=True, layers={}))


def AD_sapin():
    """Retargeting from 1 Dec and the last 10 days: the approved Christmas copy (brief §6), word for word, over the 4 ct
    floral ring turning. About 12 s."""
    line = lambda h, top: f'<div class="lx lxh" style="top:{top}px;font-size:70px">{h}</div>'
    a = '<div class="lxs"></div>' + line("Une bague sur mesure<br><i>sous le sapin ?</i>", 300)
    b2 = a + f'<div class="lx lxd" style="top:470px">Design 3D en 48 h, bague prête en 2 semaines.</div>'
    c = b2 + f'<div class="lx lxo" style="top:530px">Commandez avant le 11 décembre</div>'
    end = ('<div style="position:absolute;inset:0;background:rgba(8,8,8,.62)"></div>'
           '<img class="logo" style="top:560px;width:250px;filter:invert(1)" src="%LOGO%">'
           f'<div class="ctr serif" style="top:760px;font-size:58px;color:#F6F3EE;{SH}">Consultation <i>gratuite</i></div>'
           f'<div class="ctr" style="top:840px;font-family:Jost;font-size:30px;color:#E9E3D8;{SH}">Montréal ou en vidéo · réservez en 1 minute</div>')
    seq = [(("JOBBY3W", 20.3), 4), (("JOBBY2W", 5.7), 4), (("JOBBY3W", 1.0), 6)]
    texts = [dict(html=[a, b2, c], at=0, until=8, every=2),
             dict(html=[end], at=8, until=14, min_s=4)]
    return dict(name="AD_fetes_sapin", music="228", shots=shots(*seq), texts=texts, end=dict(beats=0, overlay=True, layers={}))


def AD_3etapes(credit=False):
    """Affordability without credit terms (Rayane, 21 Nov: « une pub qui pousse le financement »). Paying in three steps
    for a custom piece is not credit, so it can show the rings. With credit=True the end card adds « Possibilité de crédit »
    (the only credit words a product ad may carry); run that version in its own campaign. About 22 s."""
    step = lambda n, big, small: (f'<div class="lx lxp" style="top:300px;font-size:120px">{n}</div>'
                                  f'<div class="lx lxh" style="top:446px;font-size:62px">{big}</div>'
                                  f'<div class="lx lxd" style="top:526px">{small}</div>')
    hook = '<div class="lxs"></div><div class="lx lxo" style="top:300px">Sur mesure à Montréal</div>' \
           '<div class="lx lxh" style="top:346px;font-size:76px">Ta bague,<br><i>en 3 étapes.</i></div>'
    s1 = '<div class="lxs"></div>' + step(1, "250 $ <i>pour commencer</i>", "+ taxes · crédité à 100 % sur ta bague")
    s2 = '<div class="lxs"></div>' + step(2, "50 % <i>au design approuvé</i>", "quand tu dis oui au rendu 3D")
    s3 = '<div class="lxs"></div>' + step(3, "Le solde <i>à la remise</i>", "quand ta bague est prête, environ 2 semaines plus tard")
    seq = [(("BENNY42W", 1.0), 4), (("JOBBY3W", 20.3), 4), (("DUO68W", 1.5), 4), (("BENNY43W", 4.0), 4), (("JOBBY3W", 1.0), 8)]
    texts = [dict(html=[hook], at=0, until=4), dict(html=[s1], at=4, until=8), dict(html=[s2], at=8, until=12),
             dict(html=[s3], at=12, until=16), dict(html=end_card(credit=credit), at=16, until=24, every=1.2, min_s=8)]
    return dict(name="AD_fetes_3etapes" + ("_credit" if credit else ""), music="228", shots=shots(*seq), texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


REELS = {
    "AD_fetes_collection": AD_collection,
    "AD_fetes_benny": lambda: single(BENNY, "AD_fetes_benny"),
    "AD_fetes_jobby": lambda: single(JOBBY, "AD_fetes_jobby"),
    "AD_fetes_ensemble": lambda: single(SET, "AD_fetes_ensemble"),
    "AD_fetes_avis": AD_avis,
    "AD_fetes_rose": AD_rose,
    "AD_fetes_rose_prix": lambda: AD_rose(price="2 800"),
    "AD_fetes_sapin": AD_sapin,
    "AD_fetes_3etapes": AD_3etapes,
    "AD_fetes_3etapes_credit": lambda: AD_3etapes(credit=True),
}

if __name__ == "__main__":
    for n in sys.argv[1:]:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
