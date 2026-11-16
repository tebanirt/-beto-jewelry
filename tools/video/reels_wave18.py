"""Wave 18 (15 Nov 2026), after Rayane's answers of the same day:
- T06_avis_parfait: the account's only format that passed the 72 h bar (Rayane on screen first + real Google review,
  T01: 62.4 % skip, 13 s watched), with new reviews from the 15 Nov reading (20 reviews, all 5 stars). Posted as a
  REGULAR reel (Rayane said yes to one regular reel a day, so profile visitors see something alive on the grid).
- PX01_prix_2ct: first price-hook reel. The price is Rayane's approved range (brief §6, confirmed again on 15 Nov):
  2 ct lab-grown solitaire, 18k white gold, 2 300 to 2 400 $ before taxes (the site's form shows 2 350 $ for it).
  The shots show Rayane and loose stones only, never a different ring under that price.
Quotes word for word from FAITS.md, never a client's name. Usage: python3 reels_wave18.py [T06_avis_parfait ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pro
from reels_pro4 import _avis, b

REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def avis(lang, name, quotes, total):
    """The T01/T02 spec with other reviews: quotes[0] is the hook (below Rayane's face), then two more, then the total."""
    spec = _avis(lang)
    spec["name"] = name
    over = "Avis Google" if lang == "fr" else "Google review"
    t = spec["texts"]
    t[0]["html"] = pro.card_words(quotes[0], over=over, size="s72", top=820)
    t[1]["html"] = pro.card_words(quotes[1], over=over, size="s72")
    t[2]["html"] = pro.card_words(quotes[2], over=over, size="s72")
    t[3]["html"] = pro.card_words(total, size="s86")
    return spec


@reel
def T06_avis_parfait():
    spec = _t06()
    spec["music"] = "227"   # ~92 BPM: 470 (129 BPM) left only 1.4 s to read the third quote
    spec["shots"] = [
        dict(shot=b(1620314, 1.6, fx=["kenburns"]), beats=4, tr="cut"),
        dict(shot=b(1621466, 0.6, fx=["kenburns", "glow"]), beats=3, tr="smoothleft"),
        dict(shot=b(1619438, 1.0, fx=["kenburns"]), beats=3, tr="cut"),
        dict(shot=b(1657215, 0.4, slowmo=True, fx=["kenburns", "glow"]), beats=3, tr="fadewhite"),
        dict(shot=b(1626012, 0.4, fx=["kenburns", "glow"]), beats=3, tr="fade"),
        dict(shot=b(1656960, 0.4, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    return spec


def _t06():
    return avis("fr", "T06_avis_parfait",
                ["«&nbsp;Je suis absolument | en amour avec ma bague&nbsp;!&nbsp;»",
                 "«&nbsp;Le résultat | est parfait&nbsp;!&nbsp;»",
                 "«&nbsp;Rayane, très professionnel | et courtois.&nbsp;»"],
                "20 avis Google. | 5 étoiles.")


def _prix(lang, name, music):
    """Price-hook reel built on the niche's winners (15 Nov research: @junolabjewelry 10.2 M views
    "2200 usd for this 3 carat vintage style marquise diamond ring", @aleni.diamond.cus 2.4 M "$2,600 gets you this",
    @princessbridediamonds 6.4 M with a full "Ring details" list): the MODEL, the carat and the price in the very first
    card, then the ring's spec sheet one line at a time. Rayane asked on 15 Nov that the model always be stated clearly.
    Under the hook and the price: Rayane only. The round six-prong white-gold solitaire (b1656960) illustrates the model."""
    fr = lang == "fr"
    spec = _avis(lang)
    spec["name"] = name
    spec["music"] = music
    spec["shots"] = [
        dict(shot=b(1620314, 0.6, fx=["kenburns"]), beats=5, tr="cut"),           # Rayane, under model + price
        dict(shot=b(1619438, 1.0, fx=["kenburns"]), beats=3, tr="smoothleft"),     # Rayane shows loose stones
        dict(shot=b(1656960, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=3, tr="fadewhite"),  # round solitaire
        dict(shot=b(1620314, 3.6, fx=["kenburns"]), beats=3, tr="fade"),           # Rayane again
        dict(shot=b(1657215, 0.1, slowmo=True, fx=["kenburns", "glow"]), beats=4),  # under the review and the end card
    ]
    if fr:
        t = [("Solitaire 2 carats | 2 300 à 2 400&nbsp;$", "Prix indicatif · + taxes", 820, "s86"),
             ("Diamant rond | de laboratoire.", "Pierre centrale", 1000, "s72"),
             ("Couleur E · pureté VVS2 | Certificat IGI.", "Qualité", 300, "s72"),
             ("Or blanc 18k. | Design 3D en 48 h.", "Monture", 1000, "s72"),
             ("«&nbsp;Prix super abordable | comparé aux compétiteurs.&nbsp;»", "Avis Google", 300, "s72")]
    else:
        t = [("2-carat solitaire | $2,300–2,400 CAD", "Estimated price · plus tax", 820, "s86"),
             ("Round | lab-grown diamond.", "Center stone", 1000, "s72"),
             ("E color · VVS2 clarity | IGI certified.", "Quality", 300, "s72"),
             ("18k white gold. | 3D design in 48 h.", "Setting", 1000, "s72"),
             ("“His pricing is excellent | for the service and final product.”", "Google review", 300, "s72")]
    at = [(0, 5), (5, 8), (8, 11), (11, 14), (14, 18)]
    spec["texts"] = [dict(html=pro.card_words(x, over=o, size=sz, top=top), at=a, until=u)
                     for (x, o, top, sz), (a, u) in zip(t, at)]
    # The hook card appears whole from the first frame (model + carat + price readable at 0 s, like the niche's winners);
    # the spec lines keep the word-by-word reveal.
    spec["texts"][0]["html"] = spec["texts"][0]["html"][-1:]
    return spec


@reel
def PX01_prix_2ct():
    return _prix("fr", "PX01b_solitaire_2ct", "664")


@reel
def PX02_EN_solitaire_2ct():
    return _prix("en", "PX02_EN_solitaire_2ct", "480")


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
