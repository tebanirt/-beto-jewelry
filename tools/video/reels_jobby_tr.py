"""5 trial reels + a Facebook ad from the marquise 4 ct takes (17 Nov 2026). Ring-locked footage (ringlock.py):
JOBBYnL = wide (zoom 1.35), JOBBYnT = tight (zoom 1.75), both 1080x1920, ring held in place while it turns.
Facts (Rayane, 18 Nov): marquise 4 carats, lab-grown diamond, E VVS2, 14k yellow gold; IGI certificate for every stone
>= 1 ct (brief §5); floral head, hidden halo, marquise accents (visible). Approved ad lines (brief): 3D design in 48 h,
ring ready in about 2 weeks, deposit 250 $ + taxes credited 100 %, free consultation, Montreal or video.
The price reel waits for Rayane's price (PRIX env var). No client name on screen."""
import os, sys
import pro
from reelkit import S
from reels_c015 import lux, end_dark, SH
from reels_native import pill, cap
from reels_app import app


def L(clip, t, speed=1.0):   # ring-locked clip, already framed at 1080x1920: no extra crop
    return S(f"u:{clip}.mp4", t, 1, zoom=1.0, cx=540, cy=960, speed=speed, fx=[])


def label(title, top=330, size=66):
    return [f'<div class="ctr serif" style="top:{top}px;font-size:{size}px;color:#F6F3EE;{SH}">{title}</div>']


def sub(text, top):
    return (f'<div class="ctr" style="top:{top}px;font-family:Jost;font-weight:500;font-size:26px;letter-spacing:.28em;'
            f'text-transform:uppercase;color:#DABD86;padding-left:.28em;{SH}">{text}</div>')


def T1_tour():
    """The whole ring turning in place (locked), title held: a clean loop."""
    shots = [dict(shot=L("JOBBY1L", 5.4, speed=1.3), beats=18)]
    texts = [dict(html=[label("Marquise <i>4 carats</i>", size=74)[0] + sub("Diamant de laboratoire · or jaune 14k", 440)], at=0, until=18)]
    return dict(name="T1_tour", music="864", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


def T2_details():
    """Native captions: a curiosity hook, three numbered details, a soft call to action."""
    shots = [
        dict(shot=L("JOBBY3T", 20.3), beats=3, tr="cut"),
        dict(shot=L("JOBBY1T", 3.2), beats=3, tr="cut"),
        dict(shot=L("JOBBY2T", 7.6), beats=3, tr="cut"),
        dict(shot=L("JOBBY2T", 5.7), beats=3, tr="cut"),
        dict(shot=L("JOBBY3L", 5.0), beats=5),
    ]
    texts = [
        dict(html=pill(["3 détails qu'on ne voit pas", "au premier regard"]), at=0, until=3),
        dict(html=cap("1. Les accents marquise", top=330), at=3, until=6),
        dict(html=cap("2. La tête florale", top=330), at=6, until=9),
        dict(html=cap("3. Le halo caché", top=330), at=9, until=12),
        dict(html=cap("Faite sur mesure à Montréal.<br>Lien en bio.", top=300), at=12, until=17),
    ]
    return dict(name="T2_details", music="465", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


def T3_prix():
    """Question hook, the full spec, then the price (Rayane's number only)."""
    prix = os.environ.get("PRIX")
    if not prix:
        raise SystemExit("T3_prix: set PRIX (Rayane's price, before taxes), e.g. PRIX='4 500 $'")
    shots = [
        dict(shot=L("JOBBY3T", 20.3), beats=4, tr="cut"),
        dict(shot=L("JOBBY1L", 9.0), beats=4, tr="cut"),
        dict(shot=L("JOBBY3L", 5.0), beats=8),
    ]
    spec = ("Marquise 4 carats<br>Diamant de laboratoire<br>E VVS2 · certifié IGI<br>Or jaune 14k")
    texts = [
        dict(html=pill(["Combien coûte une marquise", "de 4 carats sur mesure ?"]), at=0, until=4),
        dict(html=[f'<div class="nat" style="top:300px;font-size:58px">{spec}</div>'], at=4, until=8),
        dict(html=[f'<div class="nat" style="top:330px;font-size:96px"><span class="y">{prix}</span></div>'
                   f'<div class="nat" style="top:460px;font-size:44px">+ taxes · certificat IGI inclus</div>'], at=8, until=12),
        dict(html=cap("Consultation gratuite.<br>Lien en bio.", top=300), at=12, until=16),
    ]
    return dict(name="T3_prix", music="1176", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


def T4_pov():
    """POV hook (native), the reveal, a soft call to action."""
    shots = [
        dict(shot=L("JOBBY3T", 20.3), beats=4, tr="cut"),
        dict(shot=L("JOBBY1L", 9.0), beats=3, tr="cut"),
        dict(shot=L("JOBBY2T", 1.4), beats=3, tr="cut"),
        dict(shot=L("JOBBY3L", 5.0), beats=6),
    ]
    texts = [
        dict(html=pill(["POV : ta bague de 4 carats", "est enfin prête"]), at=0, until=10),
        dict(html=cap("Consultation gratuite.<br>Lien en bio.", top=300), at=10, until=16),
    ]
    return dict(name="T4_pov", music="783", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


def T5_feu():
    """Educational and luxurious: what 'fire' is, shown on the stone, then the spec and the end card."""
    shots = [
        dict(shot=L("JOBBY3T", 20.3), beats=4, tr="cut"),
        dict(shot=L("JOBBY2T", 1.4), beats=4, tr="cut"),
        dict(shot=L("JOBBY3T", 21.8), beats=4, tr="cut"),
        dict(shot=L("JOBBY3L", 5.0), beats=6),
    ]
    texts = [
        dict(html=lux("Diamant de laboratoire", "Le <i>feu</i> d'une marquise."), at=0, until=4),
        dict(html=label("Les facettes séparent la lumière<br><i>en couleurs.</i>", size=56), at=4, until=8),
        dict(html=lux("E VVS2 · certifié IGI", "4 carats, <i>or jaune 14k.</i>"), at=8, until=12),
        dict(html=end_dark(), at=12, until=18),
    ]
    return dict(name="T5_feu", music="225", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


def choice_card(shade_a=.62):
    """End slate of the ad: the two ways to start. Kept between y 600 and 1300 so a 4:5 crop (y 285-1635) keeps it all."""
    shade = f'<div style="position:absolute;inset:0;background:rgba(8,8,8,{shade_a})"></div>'
    logo = f'<img class="logo" style="top:560px;width:260px;filter:invert(1)" src="%LOGO%">'
    head = sub("Deux façons de commencer", 760)
    o1 = (f'<div class="ctr serif" style="top:830px;font-size:58px;color:#F6F3EE;{SH}">1. Commence ton <i>design</i></div>'
          f'<div class="ctr" style="top:910px;font-family:Jost;font-size:30px;color:#E9E3D8;{SH}">Dépôt de 250 $ + taxes, crédité à 100 %</div>')
    o2 = (f'<div class="ctr serif" style="top:1010px;font-size:58px;color:#F6F3EE;{SH}">2. Consultation <i>gratuite</i></div>'
          f'<div class="ctr" style="top:1090px;font-family:Jost;font-size:30px;color:#E9E3D8;{SH}">Essaie les tailles de pierre · Montréal ou en vidéo</div>')
    return [shade + logo, shade + logo + head + o1, shade + logo + head + o1 + o2]


def AD_marquise():
    """Facebook/Instagram ad (sound off friendly): hook, three details, the promise, the two ways to start."""
    shots = [
        dict(shot=L("JOBBY3T", 20.3), beats=4, tr="cut"),
        dict(shot=L("JOBBY1T", 3.2), beats=2, tr="cut"),
        dict(shot=L("JOBBY2T", 7.6), beats=2, tr="cut"),
        dict(shot=L("JOBBY2T", 5.7), beats=2, tr="cut"),
        dict(shot=L("JOBBY1L", 9.0), beats=4, tr="cut"),
        dict(shot=L("JOBBY3L", 5.0), beats=12),
    ]
    texts = [
        dict(html=lux("Sur mesure à Montréal", "Ta bague, <i>dessinée pour toi.</i>", top=400), at=0, until=4),
        dict(html=label("Accents <i>marquise</i>", top=400), at=4, until=6),
        dict(html=label("Tête <i>florale</i>", top=400), at=6, until=8),
        dict(html=label("Halo <i>caché</i>", top=400), at=8, until=10),
        dict(html=[label("Design 3D en <i>48 h.</i>", top=400)[0] + sub("Ta bague prête en environ 2 semaines", 500)], at=10, until=14),
        dict(html=choice_card(), at=14, until=26, every=1.2),
    ]
    return dict(name="AD_marquise", music="289", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


REELS = {f.__name__: f for f in (T1_tour, T2_details, T3_prix, T4_pov, T5_feu, AD_marquise)}
for k in list(REELS):
    REELS[k + "_APP"] = (lambda f: (lambda: app(f(), 100)))(REELS[k])

if __name__ == "__main__":
    for n in sys.argv[1:]:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
