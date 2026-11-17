"""Professional-style grade with free tools: OpenColorIO ACES 2.1 studio config (official Apple Log 2 input transform),
grading in ACEScct like DaVinci (balance, exposure, contrast/pivot, saturation), output through the ACES 2.0 SDR view,
then display-referred secondaries in OkLCh (gold qualifier, diamond fire kept)."""
import numpy as np, PyOpenColorIO as ocio, warnings
warnings.filterwarnings("ignore")
CFG = ocio.Config.CreateFromBuiltinConfig("studio-config-v5.0.0_aces-v2.1_ocio-v2.6")
def _proc(src, dst):
    return CFG.getProcessor(src, dst).getOptimizedCPUProcessor(ocio.OPTIMIZATION_DEFAULT)
P_IN = _proc("Apple Log 2", "ACEScct")
P_LIN = _proc("ACEScct", "ACEScg")
P_CCT = _proc("ACEScg", "ACEScct")
def display_proc(display="Gamma 2.2 Rec.709 - Display", view="ACES 2.0 - SDR 100 nits (Rec.709)"):
    t = ocio.DisplayViewTransform(src="ACEScct", display=display, view=view)
    return CFG.getProcessor(t).getOptimizedCPUProcessor(ocio.OPTIMIZATION_DEFAULT)
P_OUT = display_proc()
def apply(p, a):
    a = np.ascontiguousarray(a, dtype=np.float32).reshape(-1, 3).copy()
    p.applyRGB(a)
    return a
AP1_LUM = np.array([0.2722287, 0.6740818, 0.0536895])   # ACEScg luminance weights
PIV = 0.4135884                                          # ACEScct value of 18 % grey

# --- OkLab (display-referred, on linearised sRGB/709 values) ---
M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566], [0.0883024619, 0.2817188376, 0.6299787005]])
M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468], [1.9779984951, -2.4285922050, 0.4505937099], [0.0259040371, 0.7827717662, -0.8086757660]])
def to_oklab(rgb):  # rgb: display 2.2 encoded
    lin = np.clip(rgb, 0, 1) ** 2.2
    lms = np.cbrt(lin @ M1.T)
    return lms @ M2.T
def from_oklab(lab):
    lms = (lab @ np.linalg.inv(M2).T) ** 3
    lin = lms @ np.linalg.inv(M1).T
    return np.clip(lin, 0, 1) ** (1 / 2.2)

def _lch(out):
    lab = to_oklab(out); C = np.hypot(lab[:, 1], lab[:, 2]); h = np.degrees(np.arctan2(lab[:, 2], lab[:, 1])) % 360
    return lab[:, 0], C, h
def _from_lch(Lk, C, h):
    return from_oklab(np.stack([Lk, C * np.cos(np.radians(h)), C * np.sin(np.radians(h))], -1))
def sstep(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def primary(P, L):
    """Layers 1-3: ACES input (official Apple Log 2), neutral balance, exposure, contrast/pivot, saturation, ACES 2.0 output."""
    cct = apply(P_IN, P)
    lin = apply(P_LIN, cct) * np.array(L["wb"]) * 2 ** L["exp"]
    cct = apply(P_CCT, np.clip(lin, 0, None))
    cct = PIV + (cct - PIV) * L["con"]
    lin = apply(P_LIN, cct)
    Y = lin @ AP1_LUM
    lin = Y[:, None] + (lin - Y[:, None]) * L["sat"]
    cct = apply(P_CCT, np.clip(lin, 0, None))
    return np.clip(apply(P_OUT, cct), 0, 1)

def finish(o, L):
    sh = L.get("shoulder")                      # soft highlight shoulder (film)
    if sh:
        o = np.where(o > sh, sh + (1 - sh) * (1 - np.exp(-(o - sh) / (1 - sh) * 1.4)) / (1 - np.exp(-1.4)), o)
    bl = L.get("black", 0.0)                    # lifted blacks (film)
    return np.clip(bl + o * (1 - bl), 0, 1)

def grade(P, L):
    """Returns (main, stone) display RGB. main: background key + gold qualifier. stone: same primaries, fire kept, cast removed."""
    out = primary(P, L)
    Lk, C, h = _lch(out)
    # layer 4a: background key (neutral, mid-dark plastic): low chroma and not a highlight -> density/tint of the backdrop
    b = L["bg"]
    wbg = (1 - sstep(Lk, b.get("lo", 0.50), b.get("hi", 0.66))) * (1 - 0.7 * sstep(C, 0.022, 0.042))   # smooth: no blotches
    Lb = Lk * (1 - wbg * (1 - b["gain"]))
    tint = np.array(b.get("tint", (0.0, 0.0)))
    # layer 4b: gold qualifier (OkLCh hue window around the measured band hue)
    g = L["gold"]
    dh = ((h - g["h"]) + 180) % 360 - 180
    wg = np.exp(-(dh / g["w"]) ** 2) * sstep(C, 0.015, 0.03) * sstep(Lk, 0.22, 0.40)
    h2 = h + (g["to"] - h) * wg * g["pull"]
    C2 = C * (1 + (g["chroma"] - 1) * wg)
    L2 = Lb * (1 + (g["bright"] - 1) * wg)
    # layer 4c: polished-gold highlights keep a gold tint (white light reflected by yellow gold is yellowish, not silver)
    wh = sstep(Lk, 0.62, 0.82) * (1 - sstep(C, 0.03, 0.06)) * (1 - sstep(Lk, 0.97, 1.0))
    ch = g.get("hl_chroma", 0.045) * wh
    a0 = C2 * np.cos(np.radians(h2)) * (1 - wh) + ch * np.cos(np.radians(g["to"]))
    b0 = C2 * np.sin(np.radians(h2)) * (1 - wh) + ch * np.sin(np.radians(g["to"]))
    C2 = np.hypot(a0, b0); h2 = np.degrees(np.arctan2(b0, a0)) % 360
    labm = np.stack([L2, C2 * np.cos(np.radians(h2)), C2 * np.sin(np.radians(h2))], -1)
    labm[:, 1] = labm[:, 1] * (1 - wbg) + tint[0] * wbg
    labm[:, 2] = labm[:, 2] * (1 - wbg) + tint[1] * wbg
    main = finish(from_oklab(labm), L)
    # stone LUT (used only inside the tracked stone mask): warm cast removed, the fire (strong chroma) kept
    s = L["stone"]
    keep = sstep(C, s["fire_c"], s["fire_c"] + 0.03)
    f = keep + (1 - keep) * s["cast"]
    Ls = (Lk ** s.get("gamma", 1.0)) * (1 - wbg) + Lb * wbg
    fs = f * (1 - wbg)
    labs = np.stack([Ls, C * fs * np.cos(np.radians(h)) + tint[0] * wbg, C * fs * np.sin(np.radians(h)) + tint[1] * wbg], -1)
    stone = finish(from_oklab(labs), L)
    return main, stone

def bake(L, path_main, path_stone, N=65):
    r = np.linspace(0, 1, N)
    B, G, R = np.meshgrid(r, r, r, indexing="ij")
    P = np.stack([R, G, B], -1).reshape(-1, 3)
    out, stone = grade(P, L)
    for o, p in ((out, path_main), (stone, path_stone)):
        with open(p, "w") as f:
            f.write(f'TITLE "Beto {L["name"]}"\nLUT_3D_SIZE {N}\n')
            np.savetxt(f, o, fmt="%.6f")
