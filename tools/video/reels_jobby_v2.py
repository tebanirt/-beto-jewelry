"""Wave 2 of the marquise 4 ct (18 Nov 2026), from the market study: hook names the exact ring (often with the price) in
frame 1, an open question held until ~8-12 s, 10-15 s total, last image = first image (loop). Ring-locked footage.
Facts: marquise 4 ct, lab-grown diamond, E VVS2, IGI certificate, 14k yellow gold, floral head, hidden halo, marquise
accents in the band; 3 350 $ + taxes (Rayane, 18 Nov; certificate included); 3D design in 48 h, ring ready in 2 weeks,
order by December 11 for Christmas (approved lines). No client name; no financing amounts; 'diamant de laboratoire' always."""
import sys
import pro
from reels_jobby_tr import L
from reels_native import pill, cap
from reels_app import app

CTA = "Consultation gratuite<br>lien en bio"


def nat(html, top=280, size=None):
    st = f"top:{top}px" + (f";font-size:{size}px" if size else "")
    return [f'<div class="nat" style="{st}">{html}</div>']


def price(top=280, small=None):
    s = f'<div class="nat" style="top:{top}px;font-size:110px"><span class="y">3 350 $</span></div>'
    s += f'<div class="nat" style="top:{top + 140}px;font-size:46px">+ taxes</div>'
    if small:
        s += f'<div class="nat" style="top:{top + 210}px;font-size:44px">{small}</div>'
    return [s]


FACE, FACE_W, ROT, HEAD, HALO, BAND, FACE2, END = ("JOBBY3T", 20.3), ("JOBBY3L", 20.3), ("JOBBY1M", 9.0), ("JOBBY2T", 7.6), \
    ("JOBBY2T", 5.7), ("JOBBY1U", 3.2), ("JOBBY3T", 21.6), ("JOBBY3L", 5.0)


def shots(*seq):
    out = []
    for i, (c, b) in enumerate(seq):
        d = dict(shot=L(*c), beats=b)
        if i < len(seq) - 1:
            d["tr"] = "cut"
        out.append(d)
    return out


def S1(variant="A"):
    """Guess the price: the answer (the price) is the payoff. B = price in the first card (only the hook changes)."""
    hook = ("Marquise 4 carats.<br>Devine le prix." if variant == "A"
            else "Marquise 4 carats, or jaune 14k :<br>3 350 $ + taxes.")
    texts = [
        dict(html=pill(hook.split("<br>")), at=0, until=2),
        dict(html=nat("Diamant de laboratoire<br>or jaune 14k"), at=2, until=6),
        dict(html=nat("Tête florale"), at=6, until=10),
        dict(html=nat("Halo caché"), at=10, until=14),
        dict(html=nat("Accents marquise<br>dans l'anneau"), at=14, until=18),
        dict(html=price(small="T'avais deviné combien ?" if variant == "A" else "Certificat IGI inclus"), at=18, until=22),
        dict(html=nat(CTA), at=22, until=24),
    ]
    return dict(name=f"S1{variant}_devine_le_prix", music="1176",
                shots=shots((FACE, 2), (ROT, 4), (HEAD, 4), (HALO, 4), (BAND, 4), (FACE2, 4), (FACE, 2)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


def S2():
    texts = [
        dict(html=pill(["Tout le monde regarde la pierre."]), at=0, until=2),
        dict(html=nat("Le vrai détail<br>est en dessous."), at=2, until=6),
        dict(html=nat("D'abord :<br>une tête florale."), at=6, until=10),
        dict(html=nat("Un halo caché,<br>sous la marquise."), at=10, until=14),
        dict(html=nat("Visible seulement<br>de côté."), at=14, until=18),
        dict(html=nat(CTA), at=18, until=20),
    ]
    return dict(name="S2_secret_dessous", music="485",
                shots=shots((FACE, 2), (FACE_W, 4), (HEAD, 4), (HALO, 4), (("JOBBY2T", 6.2), 4), (FACE, 2)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


def S3():
    texts = [
        dict(html=pill(["3 détails que tu vas manquer…", "0/3"]), at=0, until=3),
        dict(html=nat("1. Accents marquise<br>dans l'anneau"), at=3, until=7),
        dict(html=nat("2. Tête florale"), at=7, until=11),
        dict(html=nat("3. …"), at=11, until=12),
        dict(html=nat("3. Un halo caché"), at=12, until=15),
        dict(html=nat("T'en avais vu combien ?<br><span class='y'>Réponds 0, 1, 2 ou 3</span>"), at=15, until=18),
    ]
    return dict(name="S3_trois_details", music="465",
                shots=shots((FACE, 3), (BAND, 4), (HEAD, 4), (HALO, 4), (FACE, 3)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


def S4():
    texts = [
        dict(html=pill(["Si quelqu'un t'a envoyé ça…"]), at=0, until=2),
        dict(html=nat("…c'est pas un hasard."), at=2, until=6),
        dict(html=nat("Marquise 4 carats"), at=6, until=9),
        dict(html=nat("Or jaune 14k"), at=9, until=11),
        dict(html=nat("Halo caché"), at=11, until=14),
        dict(html=nat("C'est un indice.<br>Fais semblant de rien."), at=14, until=18),
        dict(html=nat("Envoie-la à qui de droit."), at=18, until=20),
    ]
    return dict(name="S4_indice", music="783",
                shots=shots((FACE, 2), (ROT, 4), (HEAD, 3), (BAND, 2), (HALO, 3), (FACE2, 4), (FACE, 2)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


def S5():
    texts = [
        dict(html=pill(["Encore possible pour Noël ?"]), at=0, until=2),
        dict(html=nat("Une bague comme celle-ci,<br>sur mesure…"), at=2, until=6),
        dict(html=nat("Design 3D en 48 h"), at=6, until=10),
        dict(html=nat("Bague prête en 2 semaines"), at=10, until=14),
        dict(html=nat("Oui, si tu commandes<br><span class='y'>avant le 11 décembre.</span>"), at=14, until=18),
        dict(html=nat(CTA), at=18, until=20),
    ]
    return dict(name="S5_noel", music="864",
                shots=shots((FACE, 2), (ROT, 4), (HEAD, 4), (HALO, 4), (FACE2, 4), (FACE, 2)),
                texts=texts, end=dict(beats=0, overlay=True, layers={}))


REELS = {"S1A": lambda: S1("A"), "S1B": lambda: S1("B"), "S2": S2, "S3": S3, "S4": S4, "S5": S5}
for k in list(REELS):
    REELS[k + "_APP"] = (lambda f: (lambda: app(f(), 100)))(REELS[k])


def _app_at(f, bpm, k, tag):
    s = app(f(), bpm, k); s["name"] += tag; return s


# Rayane posts these in the app with the song (beats on the song's tempo, k keeps ~2.3 s of reading per card)
REELS["S1B_APP128"] = lambda: _app_at(lambda: S1("B"), 128, 1.25, "128")   # « Angel Of My Dreams », JADE, 128 BPM
REELS["S5_APP150"] = lambda: _app_at(S5, 150, 1.6, "150")                  # « All I Want for Christmas Is You », ~150 BPM

if __name__ == "__main__":
    for n in sys.argv[1:]:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
