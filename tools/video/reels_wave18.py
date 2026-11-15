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


@reel
def PX01_prix_2ct():
    spec = _avis("fr")
    spec["name"] = "PX01_prix_2ct"
    spec["music"] = "664"
    spec["shots"] = [
        dict(shot=b(1620314, 2.4, fx=["kenburns"]), beats=4, tr="cut"),          # Rayane, under the hook
        dict(shot=b(1619438, 1.6, fx=["kenburns"]), beats=3, tr="smoothleft"),    # under the price: no ring
        dict(shot=b(1626012, 0.2, fx=["kenburns", "glow"]), beats=3, tr="cut"),  # loose stones, tweezers
        dict(shot=b(1621466, 1.2, fx=["kenburns", "glow"]), beats=3, tr="fadewhite"),
        dict(shot=b(1656960, 0.8, slowmo=True, fx=["kenburns", "glow"]), beats=3, tr="fade"),
        dict(shot=b(1657215, 0.8, slowmo=True, fx=["kenburns", "glow"]), beats=2),
    ]
    spec["texts"] = [
        dict(html=pro.card_words("2 carats. | Diamant de laboratoire.", over="Solitaire · or blanc 18k", size="s72", top=820),
             at=0, until=5),
        dict(html=pro.card_words("2 300 à 2 400&nbsp;$ | + taxes", over="Prix indicatif", size="s86"), at=5, until=10),
        dict(html=pro.card_words("Certificat IGI. | Design 3D en 48 h.", size="s72"), at=10, until=14),
        dict(html=pro.card_words("«&nbsp;Prix super abordable | comparé aux compétiteurs.&nbsp;»", over="Avis Google", size="s72"),
             at=14, until=18),
    ]
    return spec


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
