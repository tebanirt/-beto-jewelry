"""Rayane's turntable takes of 17 Nov 2026 evening (client ring): marquise 4 ct, floral head, hidden halo, band with
marquise and round accents, yellow gold. ProRes 422 HQ, 4K vertical, 24 fps, camera-finished colour (Rec.709 in the app).
Lesson of the C015 rejection: no look, no colour secondaries, no masks, no glow. Only levels (black 3 %, white 92 % -> full
range, in prep) and one fine sharpening at 1080 (REEL_SDR_GRADE). Never upscale: zoom <= 2.0.
Facts on screen: marquise 4 carats (Rayane), what the image shows (floral head, hidden halo, marquise accents, yellow gold)
and FAITS.md (custom made, Montreal, free consultation). Never the client's name; no karat, no lab/natural (unknown)."""
import os, sys
import pro
from reelkit import S
from reels_c015 import lux, end_dark, SH
from reels_app import app

POS = {("JOBBY3", 20.3): (1152, 1936), ("JOBBY1", 3.2): (1024, 1876), ("JOBBY2", 7.6): (1016, 1760),
       ("JOBBY2", 5.7): (1330, 1760), ("JOBBY3", 5.0): (1160, 1956), ("JOBBY1", 5.4): (1010, 1930)}   # ring centres (bright px)


def sh(clip, t, zoom, speed=1.0, dy=0):
    cx, cy = POS[(clip, t)]
    return S(f"u:{clip}.mp4", t, 1, zoom=zoom, cx=cx, cy=cy + dy, speed=speed, fx=[])


def label(title, top=330):
    return [f'<div class="ctr serif" style="top:{top}px;font-size:66px;color:#F6F3EE;{SH}">{title}</div>']


def J1_marquise_4ct():
    """Hook (face-on fire) -> three details, each named -> held end frame with the call to action."""
    shots = [
        dict(shot=sh("JOBBY3", 20.3, 1.55, dy=-90), beats=4, tr="cut"),   # face-on, the stone throws colour
        dict(shot=sh("JOBBY1", 3.2, 1.6, dy=120), beats=3, tr="cut"),     # the band: marquise and round accents (dy: hides the bright top of the box)
        dict(shot=sh("JOBBY2", 7.6, 1.5), beats=3, tr="cut"),             # from behind: the floral head
        dict(shot=sh("JOBBY2", 5.7, 1.6), beats=3, tr="cut"),             # profile: the hidden halo under the stone (cx moved: the stone stays in frame)
        dict(shot=sh("JOBBY3", 5.0, 1.45, dy=-60), beats=7),              # turns face-on under the call to action
    ]
    texts = [
        dict(html=lux("Sur mesure", "Marquise <i>4 carats.</i>"), at=0, until=4),
        dict(html=label("Accents <i>marquise</i>"), at=4, until=7),
        dict(html=label("Tête <i>florale</i>"), at=7, until=10),
        dict(html=label("Halo <i>caché</i>"), at=10, until=13),
        dict(html=end_dark(), at=13, until=20),
    ]
    return dict(name="J1_marquise_4ct", music="434", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


def J2_tour_360():
    """One full turn (back -> face -> back), slightly faster than the turntable, no cut: it loops seamlessly."""
    shots = [dict(shot=sh("JOBBY1", 5.4, 1.35, speed=1.4), beats=16)]
    sub = (f'<div class="ctr" style="top:440px;font-family:Jost;font-weight:500;font-size:24px;letter-spacing:.32em;'
           f'text-transform:uppercase;color:#DABD86;padding-left:.32em;{SH}">Tête florale · halo caché</div>')
    texts = [dict(html=[f'<div class="ctr serif" style="top:330px;font-size:72px;color:#F6F3EE;{SH}">Marquise <i>4 carats</i></div>' + sub],
                  at=0, until=16)]
    return dict(name="J2_tour_360", music="434", shots=shots, texts=texts, end=dict(beats=0, overlay=True, layers={}))


REELS = {"J1_marquise_4ct": J1_marquise_4ct, "J2_tour_360": J2_tour_360,
         "J1_marquise_4ct_APP": lambda: app(J1_marquise_4ct(), 100), "J2_tour_360_APP": lambda: app(J2_tour_360(), 100)}

if __name__ == "__main__":
    for n in sys.argv[1:] or list(REELS):
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
