import numpy as np, sys
from scipy.interpolate import PchipInterpolator
R0,Rt,c,b,g,beta=-0.05641088,0.01,47.28711236,0.00964052,0.08550479,0.69336945
Pt=c*(Rt-R0)**2
def dec(P): return np.where(P<Pt, np.sqrt(np.clip(P,0,None)/c)+R0, 2**((P-beta)/g)-b)
GAINS=np.array([0.7496,1.0,1.786])  # neutral on the white stone and band (R/G 1.334, B/G 0.56 in Log)
PTS=[(-6,0.0),(-4,0.004),(-2,0.016),(-0.5,0.045),(0.1,0.075),(0.8,0.13),(1.7,0.40),(2.5,0.64),(3.3,0.82),(4.0,0.93),(4.8,0.985),(6.5,1.0)]
cur=PchipInterpolator([p[0] for p in PTS],[p[1] for p in PTS],extrapolate=False)
LUM=np.array([0.2126,0.7152,0.0722])
def grade(rgb, sat=0.6):
    lin=np.clip(dec(rgb)*GAINS,1e-7,None)
    Y=lin@LUM
    oY=np.nan_to_num(cur(np.clip(np.log2(Y/0.18),-6,6.5)),nan=0.0)
    ratio=lin/Y[...,None]
    s=sat*np.clip(1-(oY-0.6)/0.4,0.35,1)[...,None]   # less chroma in the brightest parts: white stays white
    out=oY[...,None]*(1+(ratio-1)*s)
    sh=np.clip(1-oY/0.22,0,1)
    out[...,0]-=0.004*sh; out[...,2]+=0.006*sh           # cool, deep shadows
    return np.clip(out,0,1)
if __name__=='__main__':
    N=65; r=np.linspace(0,1,N)
    B,G,R=np.meshgrid(r,r,r,indexing='ij')
    o=grade(np.stack([R,G,B],-1).reshape(-1,3))
    with open(sys.argv[1],'w') as f:
        f.write('TITLE "Beto AppleLog2 cine v2"\nLUT_3D_SIZE 65\n')
        f.writelines(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n" for v in o)
    from PIL import Image
    for t in (3,9,20):
        a=np.fromfile(f'f_{t}.raw',dtype='<u2').reshape(1920,1080,3).astype(np.float64)/65535
        Image.fromarray((grade(a)*255+0.5).astype(np.uint8)).save(f'test2_f{t}.jpg',quality=92)
