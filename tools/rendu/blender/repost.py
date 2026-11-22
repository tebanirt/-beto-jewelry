"""Refait la retouche des pierres d'images déjà rendues (passe des pierres et masque conservés)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gempost
from PIL import Image, ImageFilter
def composite_white(src, dst, bg=(250, 250, 250)):  # même fond et même ombre de contact que scene.composite_white
    im = Image.open(src).convert('RGBA'); base = Image.new('RGBA', im.size, (*bg, 255))
    a = im.split()[3]; bb = a.getbbox()
    if bb:
        w, h = im.size; sil = a.crop(bb).resize((bb[2] - bb[0], max(2, (bb[3] - bb[1]) // 9)))
        sh = Image.new('L', im.size, 0); sh.paste(sil, (bb[0], bb[3] - sil.size[1] // 2))
        sh = sh.filter(ImageFilter.GaussianBlur(w / 60)).point(lambda v: int(v * 0.35))
        base = Image.composite(Image.new('RGBA', im.size, (120, 120, 120, 255)), base, sh)
    Image.alpha_composite(base, im).convert('RGB').save(dst, quality=95)
for out in sys.argv[1:]:
    raw, gem, mk = out.replace('.png', '_raw.png'), out.replace('.png', '_gem.png'), out.replace('.png', '_mask.png')
    if not all(os.path.exists(p) for p in (raw, gem, mk)): print('incomplet', out); continue
    tint = '_rose' in out
    gempost.apply_match(raw, mk, raw, gemsrc=gem, neutral=0.0 if tint else 0.7); composite_white(raw, out); print('retouché', out)
