"""Wave 11b: remakes without any ring worn on a finger (Rayane, 10 Nov 2026: never a ring on the pinky).
Allowed stills: rings in their box, rings held between the fingers, renders, CAD, castings, loose stones.
Usage: python3 reels_pro3.py [P03b_noel ...]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reelkit import S
from reels import card, label, endcard, FR_END, EN_END
import pro
from reels_c import IMG1, IMG2, CAD, CAST, BANDS
from reels_f import R3S_F, RMA_S, R_PAVE
from reels_g import R_LOTUS, EM_BOX
from reels_h import BOX1, BOX2

REELS = {}


def reel(fn):
    REELS[fn.__name__] = fn
    return fn


def rd(img, **kw):  # 3D render, whole ring visible on white
    return S(img, 0, 1, fit=True, fitbg="0xFFFFFF", **kw)


def cast(t, cx, cy, z=1.8, **kw):
    return S(CAST, t, 1, zoom=z, cx=cx, cy=cy, **kw)


def _sapin(lang):
    fr = lang == "fr"
    shots = [
        dict(shot=S(BOX2, 0, 1, zoom=1.0, fx=["kenburns", "glow"]), beats=6, tr="zoomin"),
        dict(shot=rd(IMG1, fx=["punch", "glow"]), beats=2, tr="smoothleft"),
        dict(shot=rd(R_PAVE, fx=["punch", "glow"]), beats=2, tr="smoothleft"),
        dict(shot=rd(R3S_F, fx=["punch", "glow"]), beats=2, tr="smoothleft"),
        dict(shot=S(EM_BOX, 0, 1, zoom=1.15, fx=["punch", "glow"]), beats=2, tr="fadewhite"),
        dict(shot=S(BOX1, 0, 1, zoom=1.1, cx=760, cy=1000, fx=["kenburns", "glow"]), beats=6, tr="fade"),
    ]
    if fr:
        texts = [
            dict(html=pro.card_words("Une bague sur mesure | sous le sapin ?", over="Noël 2026", size="s86"), at=0, until=6),
            dict(html=pro.card_words("Design 3D en 48 h, | bague prête en 2 semaines.", size="s72"), at=6, until=14),
            dict(html=pro.card_words("Commandez avant | le 11 décembre.", size="s86"), at=14, until=20),
        ]
        end = dict(beats=8, layers=endcard("Commandez avant<br>le <i>11 décembre.</i>", None, **FR_END))
        name, music = "P03b_noel", "866"
    else:
        texts = [
            dict(html=pro.card_words("A custom ring | under the tree?", over="Christmas 2026", size="s86"), at=0, until=6),
            dict(html=pro.card_words("3D design in 48&nbsp;h, | ready in 2&nbsp;weeks.", size="s72"), at=6, until=14),
            dict(html=pro.card_words("Order by | December&nbsp;11.", size="s86"), at=14, until=20),
        ]
        end = dict(beats=8, layers=endcard("Order by<br><i>December 11.</i>", None, **EN_END))
        name, music = "P12b_EN_under_the_tree", "862"
    return dict(name=name, music=music, shots=shots, texts=texts, end=end,
                glints=[dict(at=2, x=540, y=930, s=0.8), dict(at=15, x=540, y=940, s=0.8)])


@reel
def P03b_noel():
    return _sapin("fr")


@reel
def P12b_EN_under_the_tree():
    return _sapin("en")


@reel
def P08b_EN_render_to_gold():
    shots = [
        dict(shot=rd(IMG1, fx=["kenburns", "glow"]), beats=4, tr="smoothleft"),
        dict(shot=S(CAD, 9.7, 1, fit=True, fitbg="0xFFFFFF", fx=["kenburns"]), beats=5, tr="fadewhite"),
        dict(shot=cast(0.2, 532, 1248, fx=["kenburns"]), beats=5, tr="cut"),
        dict(shot=cast(11.6, 440, 1260, fx=["punch"]), beats=2, tr="cut"),
        dict(shot=S(BANDS, 12.0, 1, zoom=1.7, cx=400, cy=1200, fx=["punch"]), beats=2, tr="cut"),
        dict(shot=cast(15.2, 480, 1220, fx=["punch"]), beats=2, tr="fade"),
    ]
    texts = [
        dict(html=pro.card_words("Your ring exists | before it <i>exists</i>.", over="3D design in 48 h", size="s86"), at=0, until=4),
        dict(html=[card("We design it in <i>3D</i>.", over="01 — The design", det="Revisions included")], at=4, until=9),
        dict(html=[card("Then it comes to life<br>in <i>gold</i>.", over="02 — The casting")], at=9, until=14),
        dict(html=[card("Next step:<br>the <i>stones</i>.", over="03 — The setting")], at=14, until=20),
    ]
    end = dict(beats=8, layers=endcard("From idea <i>to gold.</i>", None, **EN_END))
    return dict(name="P08b_EN_render_to_gold", music="744", shots=shots, texts=texts, end=end)


@reel
def P09b_designs_3d():
    seq = [(IMG1, "Marquise"), (R_PAVE, "Ovale pavé"), (R3S_F, "Trois pierres"), (RMA_S, "Marquise alternée"),
           (IMG2, "Halo caché"), (R_LOTUS, "Griffes en pétales")]
    shots = [dict(shot=S(BOX2, 0, 1, zoom=1.0, fx=["kenburns", "glow"]), beats=4, tr="fadewhite")]
    shots += [dict(shot=rd(p, fx=["punch", "glow"]), beats=2, tr=("smoothleft" if i % 2 == 0 else "cut")) for i, (p, _) in enumerate(seq)]
    shots[-1]["tr"] = "fade"
    texts = [dict(html=pro.card_words("Chaque bague | est <i>unique</i>.", over="Designs 3D Beto Jewelry", size="s86"), at=0, until=4)]
    texts += [dict(html=[label(i + 1, t)], at=4 + 2 * i, until=6 + 2 * i) for i, (_, t) in enumerate(seq)]
    end = dict(beats=8, layers=endcard("La prochaine,<br><i>c’est la tienne.</i>", None, **FR_END))
    return dict(name="P09b_designs_3d", music="267", shots=shots, texts=texts, end=end,
                glints=[dict(at=1, x=540, y=930, s=0.7)])


if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM from {st:.2f}s -> {out}", flush=True)
