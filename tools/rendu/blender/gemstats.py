"""Mesure du contraste d'une pierre : part de noirs (<0,25), de blancs (>0,85), écart-type, détail fin (gradient)."""
import sys, numpy as np
from PIL import Image, ImageFilter
def stats(path, box=None):
    im = Image.open(path).convert('L')
    if box: w, h = im.size; im = im.crop((int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)))
    a = np.asarray(im.resize((300, 300)), float) / 255
    g = np.asarray(im.resize((300, 300)).filter(ImageFilter.FIND_EDGES), float) / 255
    return dict(noir=round(float((a < 0.25).mean()), 3), blanc=round(float((a > 0.85).mean()), 3), ecart=round(float(a.std()), 3), detail=round(float(g.mean()), 3), moyenne=round(float(a.mean()), 3))
if __name__ == '__main__':
    print(stats(sys.argv[1], tuple(map(float, sys.argv[2].split(','))) if len(sys.argv) > 2 else None))
