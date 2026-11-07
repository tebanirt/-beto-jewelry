"""Retouche des pierres seulement (comme en retouche joaillerie) : niveaux, netteté, neutralité.
apply(src, mask, dst, noir, blanc, gamma, nettete, neutre) — le métal n'est jamais touché."""
import numpy as np
from PIL import Image, ImageFilter


def apply(src, mask, dst, black=0.30, white=0.80, gamma=1.0, sharp=1.2, neutral=0.6, gemsrc=None):
    im = Image.open(src).convert('RGBA')
    base = np.asarray(im, float)[..., :3] / 255
    if gemsrc:  # pierres prises dans la passe des pierres
        gi = np.asarray(Image.open(gemsrc).convert('RGBA').resize(im.size))
        im = Image.fromarray(np.concatenate([gi[..., :3], np.asarray(im)[..., 3:]], -1))
    rgb = np.asarray(im, float)[..., :3] / 255; al = np.asarray(im, float)[..., 3:] / 255
    m = np.asarray(Image.open(mask).convert('L').resize(im.size), float)[..., None] / 255
    # netteté (masque flou) sur l'image entière, appliquée seulement dans la pierre
    blur = np.asarray(im.convert('RGB').filter(ImageFilter.GaussianBlur(max(1.0, im.size[0] / 900))), float) / 255
    g = np.clip(rgb + sharp * (rgb - blur), 0, 1)
    lum = (g @ np.array([0.2126, 0.7152, 0.0722]))[..., None]
    g = g * (1 - neutral) + lum * neutral  # diamant incolore : couleurs parasites atténuées
    g = np.clip((g - black) / max(1e-3, white - black), 0, 1) ** gamma
    out = base * (1 - m) + g * m
    Image.fromarray((np.concatenate([out, al], -1) * 255 + 0.5).clip(0, 255).astype(np.uint8), 'RGBA').save(dst)


REF_Q = __file__.rsplit('/', 1)[0] + '/../tone_ref.npy'  # courbe tonale de référence (quantiles de luminance d'une pierre photographiée)


def make_ref(img, box=(0.08, 0.08, 0.92, 0.92), out=REF_Q):
    im = Image.open(img).convert('L'); w, h = im.size
    a = np.asarray(im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h))), float) / 255
    np.save(out, np.quantile(a.ravel(), np.linspace(0, 1, 257)))


def apply_match(src, mask, dst, gemsrc=None, strength=1.0, sharp=0.0, neutral=0.7, ref=REF_Q):
    """Pierres seulement : la répartition des tons (noirs, gris, blancs) suit la courbe de référence ; le métal n'est pas touché."""
    im = Image.open(src).convert('RGBA'); base = np.asarray(im, float)[..., :3] / 255; al = np.asarray(im, float)[..., 3:] / 255
    gi = np.asarray(Image.open(gemsrc).convert('RGBA').resize(im.size)) if gemsrc else np.asarray(im)
    rgb = gi[..., :3] / 255.0
    m = np.asarray(Image.open(mask).convert('L').resize(im.size), float)[..., None] / 255
    if sharp:
        blur = np.asarray(Image.fromarray(gi[..., :3]).filter(ImageFilter.GaussianBlur(max(1.0, im.size[0] / 900))), float) / 255
        rgb = np.clip(rgb + sharp * (rgb - blur), 0, 1)
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722])
    rgb = rgb * (1 - neutral) + lum[..., None] * neutral
    q_ref = np.load(ref); sel = m[..., 0] > 0.5
    # pierre centrale et petites pierres traitées à part (sinon la grande pierre impose sa courbe aux petites)
    from scipy import ndimage
    lab, n = ndimage.label(sel)
    regions = [sel]
    if n > 1:
        sizes = ndimage.sum(sel, lab, range(1, n + 1)); big = int(np.argmax(sizes)) + 1
        center = lab == big; small = sel & ~center
        if small.sum() > 400 and center.sum() > 400: regions = [center, small]
    g = rgb.copy()
    for ri, reg in enumerate(regions):
        if reg.sum() < 16: continue  # pierre invisible dans cette vue : rien à retoucher
        st = strength if (len(regions) == 1 or ri == 0) else 0.65 * strength  # petites pierres : courbe adoucie (moins de grain)
        q_src = np.quantile(lum[reg], np.linspace(0, 1, 257))
        q_src = np.maximum.accumulate(q_src + np.arange(257) * 1e-6)
        lut = np.interp(rgb, q_src, q_ref)  # même courbe sur les trois canaux : la pierre reste incolore
        w = reg[..., None] if len(regions) > 1 else 1.0
        if len(regions) > 1:  # bords adoucis : chaque région s'étend d'un pixel
            w = ndimage.binary_dilation(reg, iterations=2)[..., None]
        g = np.where(w, rgb * (1 - st) + lut * st, g)
    out = base * (1 - m) + g * m
    Image.fromarray((np.concatenate([out, al], -1) * 255 + 0.5).clip(0, 255).astype(np.uint8), 'RGBA').save(dst)
