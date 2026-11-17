"""Rayane's first studio clip (17 Nov 2026): oval solitaire, white metal, on the turntable. iPhone 17 Pro Max 48 mm,
Apple Log 2, 24 fps, 144 deg, ISO 80. Graded by dl_c015/mklut.py (Apple Log decode, white set on the stone and the band,
luminance S-curve: black velvet, bright stone, cool shadows) + a light bloom on the sparkles -> assets/C015_grade.mp4.
Facts on screen: only what the image shows (oval solitaire) and FAITS.md (custom made in Montreal, free consultation)."""
import sys
import pro
from reelkit import S
from reels_native import pill, cap

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


REELS = {"V1_ovale_cine": V1_ovale_cine}

if __name__ == "__main__":
    for n in sys.argv[1:] or list(REELS):
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
