"""Apple Log 2 -> Rec.709 cinematic grade for Beto's turntable shots (black plastic turntable, 14k yellow gold, white diamond).
v10 (17 Nov 2026). Usage: python applelog2_grade.py grade.cube   (then stone_mask.py and enc_applelog2.sh: see that script)
- White balance on the black turntable (neutral), so the gold stays gold (Rayane's lamps are warmer than the app's 5600 K).
- Luminance-only S-curve (a per-channel curve turned the band pink): luminous ring, natural background.
- Chroma richer in the mid-tones (gold), fading to white in the brightest facets; warm hues lean yellow, not pink.
- Clipped highlights (any Log channel near its ceiling) become pale 14k gold, not silver: the band is yellow gold.
  The diamond is kept white afterwards inside the tracked stone mask (stone_mask.py)."""
import numpy as np, sys
from scipy.interpolate import PchipInterpolator
R0,Rt,c,b,g,beta=-0.05641088,0.01,47.28711236,0.00964052,0.08550479,0.69336945
Pt=c*(Rt-R0)**2
def dec(P): return np.where(P<Pt, np.sqrt(np.clip(P,0,None)/c)+R0, 2**((P-beta)/g)-b)
GAINS=np.array([0.746,1.0,1.601])          # neutral on the black velvet
LUM=np.array([0.2126,0.7152,0.0722])
TINT=np.array([1.0,0.93,0.74]); TINT=TINT/(TINT@LUM)
PTS=[(-6,0.0),(-4,0.003),(-2,0.012),(-0.5,0.032),(0.1,0.055),(0.8,0.115),(1.5,0.40),(2.2,0.66),(3.0,0.85),(3.8,0.94),(4.8,0.99),(6.5,1.0)]   # v10: luminous ring, natural turntable
cur=PchipInterpolator([p[0] for p in PTS],[p[1] for p in PTS],extrapolate=False)
def ramp(x,a,b_): return np.clip((x-a)/(b_-a),0,1)
def grade(P):
    lin=np.clip(dec(P)*GAINS,1e-7,None)
    Y=lin@LUM; ev=np.log2(Y/0.18)
    oY=np.nan_to_num(cur(np.clip(ev,-6,6.5)),nan=0.0)
    ratio=lin/Y[...,None]
    s=1.45-1.35*ramp(ev,1.9,3.6)                  # gold rich in mid-tones -> white in the brightest facets
    s=s*(1-ramp(P.max(-1),0.84,0.90))             # clipped highlights: neutral
    s=s*ramp(ev,-1.0,0.6)*0.9+0.0*(1-ramp(ev,-1.0,0.6))   # velvet: no chroma (pure black)
    out=oY[...,None]*(1+(ratio-1)*s[...,None]*np.array([0.72,1.0,1.28]))   # warm hues lean yellow (14k yellow gold), not pink
    cl=ramp(P.max(-1),0.84,0.90)[...,None]*0.75  # clipped polish on the band: pale 14k gold, not silver
    out=out*(1-cl)+oY[...,None]*TINT*cl
    sh=np.clip(1-oY/0.18,0,1)
    out[...,2]+=0.004*sh                          # a hint of cool in the blacks
    return np.clip(out,0,1)
if __name__=='__main__':
    N=65; r=np.linspace(0,1,N)
    B,G,R=np.meshgrid(r,r,r,indexing='ij')
    o=grade(np.stack([R,G,B],-1).reshape(-1,3))
    with open(sys.argv[1],'w') as f:
        f.write('TITLE "Beto AppleLog2 gold+diamond"\nLUT_3D_SIZE 65\n')
        f.writelines(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n" for v in o)
