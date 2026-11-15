"""Wave 5 — hero photo of three pink lab-grown diamonds (pear, emerald, oval) + vote.
Usage: python3 reels_e.py [E01 ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S, build
from reels import card, endcard, end_tl, end_solid, sh, FR_END, EN_END, ROSE_PEAR, ROSE_EM2, ROSE_MQ

REELS = {}
TRIO = "img:ee04a118-image.jpg"   # photo: pink lab-grown pear, emerald and oval in a gem jar


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def _vote(lang):
    fr = lang == "fr"
    items = [("shot", S(TRIO, 0, 3.0, fx=["kenburns"])),
             sh(ROSE_PEAR, 1.0, 0.2, fx=["flash", "punch"]),
             sh(ROSE_EM2, 1.0, -0.2, fx=["punch"]),
             sh(ROSE_MQ, 1.0, fx=["punch", "flash_out"]),
             end_solid(2.0)]
    if fr:
        L = {"h": card("Poire, émeraude<br>ou <i>ovale</i> ?", over="Diamants de laboratoire roses", size="s86"),
             "c": card("Dis-le en <i>commentaire</i>.", size="s86")}
        L.update(endcard("Ton rose, <i>ta bague.</i>", None, **FR_END))
    else:
        L = {"h": card("Pear, emerald<br>or <i>oval</i>?", over="Pink lab-grown diamonds", size="s86"),
             "c": card("Tell us in the <i>comments</i>.", size="s86")}
        L.update(endcard("Your pink, <i>your ring.</i>", None, **EN_END))
    tl = [("h", 0, 0, 3.0, 0, 0), ("c", 3.0, 0.12, 6.0, 0, 12)] + end_tl(6.0, 8.0)
    au = ([(0.2, "sparkle", 0.6), (2.98, "whoosh_rev"), (3.0, "impact", 0.7), (4.0, "tick"), (5.0, "tick"),
           (6.0, "impact", 0.5)], "lux")
    return items, L, tl, au


@reel
def E01_trois_roses():
    return _vote("fr")


@reel
def E02_EN_three_pinks():
    return _vote("en")


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        items, L, tl, au = REELS[n]()
        out, total = build(n, items, L, tl, au)
        print(f"{n}: {total:.2f}s -> {out}", flush=True)
