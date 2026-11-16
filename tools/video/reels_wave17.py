"""Wave 17 (15 Nov 2026): variants of the account's best reel so far — T01 « Vous êtes vraiment à l'écoute. »
(real Google review quoted word for word, Rayane on screen first): 62.4 % skip, 13 s average watch (14 Nov),
and its English version T02: 63 % skip. One thing changes per variant: the review quoted in the hook.
Quotes only from FAITS.md, word for word, without names. Usage: python3 reels_wave17.py [T03_avis_souhaitais ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pro
from reels_pro4 import _avis

REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


FIRST = {"fr": "«&nbsp;Vous êtes vraiment | à l’écoute.&nbsp;»", "en": "“He took the time | to listen to what I wanted.”"}


def variant(lang, name, first, swap):
    """T01/T02 with another review as the hook: the quote at card `swap` moves to the first card and the
    original hook takes its place, so no quote is shown twice. Everything else is unchanged."""
    spec = _avis(lang)
    spec["name"] = name
    over = "Avis Google" if lang == "fr" else "Google review"
    spec["texts"][0]["html"] = pro.card_words(first, over=over, size="s72", top=820)
    spec["texts"][swap]["html"] = pro.card_words(FIRST[lang], over=over, size="s72")
    return spec


@reel
def T03_avis_souhaitais():
    return variant("fr", "T03_avis_souhaitais", "«&nbsp;C’est exactement | ce que je souhaitais.&nbsp;»", 1)


@reel
def T04_avis_attentes():
    return variant("fr", "T04_avis_attentes", "«&nbsp;Au-dessus | de mes attentes.&nbsp;»", 2)


@reel
def T05_EN_five_stars():
    return variant("en", "T05_EN_five_stars", "“5 stars | isn’t enough.”", 2)


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
