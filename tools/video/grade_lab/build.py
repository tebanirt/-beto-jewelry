"""Bake the LUTs of a look and build its 4K ffmpeg chain (layers 1-5). Usage: build.py LOOK [test t1 t2 ...]"""
import sys, os, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lab, looks
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); DL = os.environ.get("C015_DIR", os.path.join(D, "..", "dl_c015"))  # C015.mov + mask_c015.mkv
SRC = os.path.join(DL, "C015.mov"); MASK = os.path.join(DL, "mask_c015.mkv")
W, H, CX, CY = 2160, 3840, 1080, 2050
def vignette(k, path):
    if os.path.exists(path): return
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - CX) / 1250) ** 2 + ((yy - CY) / 1750) ** 2)
    v = 1 - (1 - k) * np.clip((d - 0.35) / 0.9, 0, 1) ** 1.6
    Image.fromarray((np.repeat(v[..., None], 3, -1) * 65535).astype(np.uint16), "RGB").save(path) if False else \
        Image.fromarray((v * 255 + 0.5).astype(np.uint8)).save(path)
def chain(key, L):
    m, s = f"{D}/{key}_main.cube", f"{D}/{key}_stone.cube"
    if not os.path.exists(m): lab.bake(L, m, s)
    g = ("[0:v]scale=in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=gbrp16le,split=2[a][b];"
         f"[a]lut3d=file={m}:interp=tetrahedral[m];[b]lut3d=file={s}:interp=tetrahedral[s];"
         "[1:v]scale=2160:3840:flags=bicubic,format=gbrp16le[k];[m][s][k]maskedmerge")
    if L.get("despeckle"):   # tiny bright specks of the plastic -> removed where the surround is dark (ring untouched)
        g += ("[x];[x]split=3[x1][x2][x3];[x1]erosion,dilation[op];"
              "[x2]extractplanes=g,gblur=sigma=14,lut=c0='if(lt(val,9000),65535,if(lt(val,16000),65535*(16000-val)/7000,0))',format=gbrp16le[dm];"
              "[x3][op][dm]maskedmerge")
    g += ",format=gbrp"
    if L.get("vignette", 1) < 1:
        vp = f"{D}/vig_{int(L['vignette']*100)}.png"; vignette(L["vignette"], vp)
        g += f"[y];movie={vp},format=gbrp,loop=-1:1:0[vg];[y][vg]blend=all_mode=multiply"
    if L.get("glow") or L.get("halation"):
        g += "[z];[z]split[z1][z2];[z2]scale=540:960,curves=all='0/0 0.86/0 1/1',split[h1][h2];"
        g += "[h1]gblur=sigma=2.5[q1];[h2]gblur=sigma=9[q2];[q1][q2]blend=all_mode=screen"
        if L.get("halation"):
            g += ",colorchannelmixer=rr=1:gg=0.55:bb=0.32"
        g += f",scale=2160:3840[gl];[z1][gl]blend=all_mode=screen:all_opacity={L.get('glow') or L.get('halation'):.3f}"
    g += ",format=yuv444p"
    if L.get("grain"):
        g += f",noise=c0s={L['grain']*4:.1f}:c0f=t"
    g += ",scale=out_range=tv:flags=accurate_rnd,format=yuv420p[v]"
    return g
if __name__ == "__main__":
    key = sys.argv[1]; L = looks.LOOKS[key]; g = chain(key, L)
    if len(sys.argv) > 2 and sys.argv[2] == "test":
        for t in sys.argv[3:]:
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", t, "-i", SRC, "-ss", t, "-i", MASK, "-frames:v", "1",
                            "-filter_complex", g, "-map", "[v]", f"{D}/test_{key}_{t}.png"], check=True)
    else:
        out = os.environ.get("C015_OUT", os.path.join(D, "..", "edit", "assets", f"C015_{key}.mp4"))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-t", "28", "-i", SRC, "-t", "28", "-i", MASK, "-an", "-filter_complex", g, "-map", "[v]",
                        "-c:v", "libx264", "-preset", "fast", "-crf", "10", "-profile:v", "high", "-r", "24",
                        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-color_range", "tv",
                        "-movflags", "+faststart", out + ".part.mp4"], check=True)
        os.replace(out + ".part.mp4", out)      # a restart mid-encode never leaves a broken master
        print("OK", out)
