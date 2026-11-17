"""Five looks for the 14k yellow gold oval solitaire (C015), aligned on the research (17 Nov 2026):
14k gold measured on alloy data sheets (Shapeways/Legor SCA5, Golden Sun): CIELAB L* 85-87, a* +2 to +3, b* 18-19,
hue h_ab 81-84 deg flat; with multiple reflections C* 32-46 at h_ab 71-76 deg. In OkLCh: hue 76-79, chroma 0.064-0.083.
(A first, unmeasured target of HSV 46-50 deg made the gold lemon: h_ab 91-98, a* negative. Corrected the same day.)
Diamond body neutral with its fire kept; a few facets must reach 100 %. Measured band in the neutral ACES render:
OkLCh hue 66, chroma 0.038, L 0.63. Display % below = Rec.709 gamma 2.2 code values."""
WB = [0.768, 1.0, 1.78]          # neutral on the plastic turntable (measured in ACEScg)
GOLD = dict(h=66, w=16)
STONE = dict(fire_c=0.05, cast=0.20, gamma=1.0)
LOOKS = {
 "A_noir":     dict(name="Noir atelier (Graff, Harry Winston)", wb=WB, exp=0.30, con=1.18, sat=1.05,
                    bg=dict(gain=0.05, lo=0.52, hi=0.72), gold=dict(GOLD, to=78, pull=0.9, chroma=2.4, bright=1.0, hl_chroma=0.045),
                    stone=dict(STONE, gamma=1.05), despeckle=True, vignette=0.97, glow=0.06, halation=0, grain=0.4),
 "B_charbon":  dict(name="Charbon velours (De Beers, Cartier)", wb=WB, exp=0.30, con=1.08, sat=1.05,
                    bg=dict(gain=0.42, lo=0.50, hi=0.68), gold=dict(GOLD, to=78, pull=0.9, chroma=2.3, bright=1.0, hl_chroma=0.045),
                    stone=STONE, despeckle=True, vignette=0.40, glow=0.10, halation=0, grain=0.7),
 "C_or_chaud": dict(name="Or chaud (Mejuri)", wb=[0.79, 1.0, 1.70], exp=0.30, con=1.10, sat=1.08,
                    bg=dict(gain=0.17, lo=0.50, hi=0.68, tint=(0.004, 0.006)), gold=dict(GOLD, to=75, pull=0.9, chroma=2.4, bright=1.02, hl_chroma=0.055),
                    stone=dict(STONE, cast=0.10), despeckle=True, vignette=0.85, glow=0.16, halation=0, grain=0.5),
 "D_film":     dict(name="Film de campagne (Tiffany, Graff)", wb=WB, exp=0.25, con=1.02, sat=0.96,
                    bg=dict(gain=0.24, lo=0.50, hi=0.68, tint=(-0.003, -0.004)), gold=dict(GOLD, to=78, pull=0.85, chroma=1.8, bright=1.0, hl_chroma=0.040),
                    stone=STONE, black=0.055, shoulder=0.85, despeckle=False, vignette=0.80, glow=0.0, halation=0.15, grain=1.2),
 "E_naturel":  dict(name="Naturel (comme sur l'iPhone)", wb=WB, exp=0.25, con=1.06, sat=1.0,
                    bg=dict(gain=0.34, lo=0.50, hi=0.68), gold=dict(GOLD, to=79, pull=0.85, chroma=1.9, bright=1.0, hl_chroma=0.040),
                    stone=dict(STONE, cast=0.25), despeckle=False, vignette=1.0, glow=0.0, halation=0, grain=0),
}
