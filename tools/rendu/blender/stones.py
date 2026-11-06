"""Vignettes réalistes des pierres (formes et couleurs) pour le configurateur — rendu Cycles, une seule scène."""
import sys, json, math, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import scene, gems, bpy
from mathutils import Matrix
OUT = sys.argv[sys.argv.index('--') + 1]
RES = int(sys.argv[sys.argv.index('--') + 2]) if len(sys.argv) > sys.argv.index('--') + 2 else 320
scene.reset()
dm = scene.mat_diamond()
glass = dm.node_tree.nodes['glass']
root = bpy.data.objects.new('root', None); bpy.context.scene.collection.objects.link(root)
S = 4.6  # demi-longueur de la pierre (unités ~ mm)
def put(shape):
    for o in [o for o in bpy.data.objects if o.name.startswith('stone')]: bpy.data.objects.remove(o, do_unlink=True)
    V, F = gems.gem(shape); V = V * S
    ob = scene.mesh_obj('stone', V, F, None, dm, smooth=False)
    ob.rotation_euler = (math.radians(0), 0, 0)  # table vers le haut (z)
    return ob
put('rond')
scene.studio('dessus', RES, 96, ring_center=(0, 0, 0.6), dist=34)
sc = bpy.context.scene
for o in bpy.data.objects:  # pas d'ombre au sol pour des vignettes
    if o.name == 'ombre': o.data.energy = 0
LAB = {'incolore': (1, 1, 1), 'bleu': (0.45, 0.62, 1.0), 'rose': (1.0, 0.62, 0.78), 'jaune': (1.0, 0.86, 0.38), 'vert': (0.5, 0.92, 0.6)}
GEMS = {'saphir': ((0.12, 0.26, 0.9), 1.77), 'saphirrose': ((1, 0.42, 0.68), 1.77), 'saphirjaune': ((1, 0.78, 0.25), 1.77), 'rubis': ((0.9, 0.08, 0.16), 1.77),
        'emeraude': ((0.12, 0.66, 0.34), 1.58), 'morganite': ((1, 0.7, 0.62), 1.58), 'aigue': ((0.6, 0.9, 1), 1.58), 'tanzanite': ((0.35, 0.36, 0.95), 1.69)}
jobs = [('forme_' + s, s, (1, 1, 1), 2.417) for s in gems.SHAPES]
jobs += [('labo_' + k, 'rond', c, 2.417) for k, c in LAB.items() if k != 'incolore']
jobs += [('gemme_' + k, 'rond', c, ior) for k, (c, ior) in GEMS.items()]
only = set(sys.argv[sys.argv.index('--') + 3].split(',')) if len(sys.argv) > sys.argv.index('--') + 3 else None
for name, shape, col, ior in jobs:
    if only and name not in only: continue
    put(shape)
    glass.inputs['Color'].default_value = (*col, 1); glass.inputs['IOR'].default_value = ior
    raw = f'{OUT}/{name}_raw.png'; sc.render.filepath = raw; bpy.ops.render.render(write_still=True)
    from PIL import Image
    im = Image.open(raw).convert('RGBA'); bb = im.getbbox()
    if bb:
        cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2; half = max(bb[2] - bb[0], bb[3] - bb[1]) / 2 * 1.08
        im = im.crop((int(cx - half), int(cy - half), int(cx + half), int(cy + half)))
    im = im.resize((160, 160), Image.LANCZOS); im.save(f'{OUT}/{name}.png')
    print('pierre', name, flush=True)
