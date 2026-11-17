"""Rayane's first studio clip (17 Nov 2026): oval solitaire, 14k yellow gold band, white diamond, on the turntable. iPhone 17 Pro Max 48 mm,
Apple Log 2, 24 fps, 144 deg, ISO 80. Graded by tools/video/applelog2_grade.py (v6: white set on the black velvet so the
gold stays gold, luminance S-curve, clipped polish tinted pale 14k gold) + enc_applelog2.sh (diamond mask kept white,
clarity for the mirror polish, light bloom) -> assets/C015_grade_v6.mp4.
Facts on screen: what the image shows (oval solitaire), what Rayane stated (white diamond, 14k yellow gold) and FAITS.md
(custom made in Montreal, free consultation). No carat, no lab/natural: unknown for this ring."""
import sys
import pro
from reelkit import S
from reels_native import pill, cap
from reels_app import app

G = "u:C015_grade.mp4"
POS = {3.0: (1120, 2050), 5.4: (1080, 2104), 9.6: (960, 2040), 14.6: (950, 1935), 24.8: (1095, 2070)}   # find_ring.py


def sh(t, zoom, fx=(), key=None):
    cx, cy = POS.get(key or t, (1080, 1940))
    return S(G, t, 1, zoom=zoom, cx=cx, cy=cy, fx=list(fx))


def V1_ovale_cine():
    shots = [
        dict(shot=sh(3.0, 1.55, ["kenburns"]), beats=4, tr="fade"),     # the oval turns toward the camera
        dict(shot=sh(5.4, 2.4, ["kenburns"]), beats=3, tr="fade"),      # tight on the stone, face-on
        dict(shot=sh(9.6, 1.45, ["kenburns"]), beats=3, tr="fade"),      # profile: prongs and setting
        dict(shot=sh(14.6, 1.75, ["kenburns"]), beats=3, tr="fade"),    # behind: the band, the stone on top
        dict(shot=sh(24.8, 1.6, ["kenburns"]), beats=5),                # turns face-on again, under the end text
    ]
    texts = [
        dict(html=pill(["Solitaire ovale.", "Fait sur mesure à Montréal."], top=300), at=0, until=4),
        dict(html=cap("Consultation gratuite.<br>Lien en bio.", top=1330), at=14, until=18),
    ]
    sweeps = [dict(at=13.2, beats=2, alpha=0.22)]
    return dict(name="V1_ovale_cine", music="434", shots=shots, texts=texts, sweeps=sweeps,
                end=dict(beats=0, overlay=True, layers={}))


G6 = "u:C015_grade_v10.mp4"   # v10: realism first (no denoise, no 4K sharpening, subtle bloom); render with REEL_FPS=24
POS6 = {24.8: (1085, 2150), 22.6: (1100, 2010), 3.3: (1090, 2100), 2.2: (1142, 2002), 9.6: (932, 2028), 15.0: (944, 1932), 4.6: (1076, 2120), 26.4: (1076, 2106)}   # find_ring.py on the v9 grade (centre of the motion for 24.8 and 3.3)


def s6(t, zoom, fx=(), slowmo=False, dy=0):
    """Locked-off crop, lanczos downscale. No Ken Burns: ffmpeg zoompan steps in whole pixels (jitter) and pushes
    past 1:1. Zoom <= 2.0 keeps at least 1080 source pixels across, so the 4K is never upscaled."""
    cx, cy = POS6.get(t, (1080, 1980))
    return S(G6, t, 1, zoom=zoom, cx=cx, cy=cy + dy, fx=list(fx), slowmo=slowmo)


SH = "text-shadow:0 4px 26px rgba(0,0,0,.75)"


def lux(over, title, top=300, size=84):
    return [f'<div class="ctr" style="top:{top}px"><span class="over" style="color:#DABD86;{SH}">{over}</span>'
            f'<div class="serif" style="font-size:{size}px;color:#F6F3EE;{SH}">{title}</div></div>']


def end_dark(top=290):
    """Logo, then the title, then the call to action: each stage keeps what came before (held end frame, no fade)."""
    logo = f'<img class="logo" style="top:{top}px;width:300px;filter:invert(1) drop-shadow(0 4px 20px rgba(0,0,0,.6))" src="%LOGO%">'
    title = f'<div class="ctr serif" style="top:{top + 210}px;font-size:76px;color:#F6F3EE;{SH}">Consultation <i>gratuite.</i></div>'
    cta = (f'<div class="ctr" style="top:{top + 318}px;font-family:Jost;font-weight:500;font-size:30px;letter-spacing:.32em;'
           f'text-transform:uppercase;color:#DABD86;padding-left:.32em;{SH}">Lien en bio</div>'
           f'<div class="ctr" style="top:{top + 370}px;font-family:Jost;font-weight:400;font-size:22px;letter-spacing:.3em;'
           f'text-transform:uppercase;color:#ABA59B;padding-left:.3em;{SH}">Montréal · ou en vidéo</div>')
    return [logo, logo + title, logo + title + cta]


def V2_ovale_or_jaune():
    """Hook -> reveal -> close (GemIQ 3-asset structure). Grade v9: deep velvet black, light denoise: the stone face-on in frame 1, the angles, a held end frame."""
    shots = [
        dict(shot=s6(24.8, 2.0, dy=-110), beats=4, tr="cut"),  # HOOK: the oval turns face-on (2.0 = 1:1 pixels, no upscale)
        dict(shot=s6(2.2, 1.8), beats=3, tr="cut"),       # side: the band's arc (14k yellow gold), the stone turning in
        dict(shot=s6(9.6, 1.8), beats=3, tr="cut"),       # profile: prongs and basket
        dict(shot=s6(15.0, 1.7, dy=70), beats=3, tr="cut"),     # behind: the band, the stone on top (dy: keeps the bright top of the turntable out)
        dict(shot=s6(22.6, 1.8), beats=3, tr="cut"),      # the stone comes back around
        dict(shot=s6(3.3, 1.85, dy=-70), beats=7),    # turns face-on under the call to action; loops into the hook
    ]
    texts = [
        dict(html=lux("Solitaire ovale", "Diamant blanc,<br><i>or jaune 14k.</i>"), at=0, until=4),
        dict(html=lux("Fait sur mesure", "à <i>Montréal.</i>", size=80), at=7, until=13),
        dict(html=end_dark(), at=16, until=23),
    ]
    return dict(name="V2_ovale_or_jaune", music="434", shots=shots, texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


REELS = {"V1_ovale_cine": V1_ovale_cine, "V2_ovale_or_jaune": V2_ovale_or_jaune,
         "V2_ovale_or_jaune_APP": lambda: app(V2_ovale_or_jaune(), 100)}

if __name__ == "__main__":
    for n in sys.argv[1:] or list(REELS):
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
