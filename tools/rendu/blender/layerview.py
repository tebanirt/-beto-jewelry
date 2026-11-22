"""Aperçu rapide par calque d'un .3dm (projection de face et de côté), pour comprendre un fichier."""
import sys, rhino3dm, numpy as np, collections
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import load3dm
from PIL import Image, ImageDraw
m = rhino3dm.File3dm.Read(sys.argv[1]); out = sys.argv[2]
L = {i: m.Layers[i] for i in range(len(m.Layers))}
idefs = {str(d.Id): d for d in m.InstanceDefinitions}; byid = {str(o.Attributes.Id): o for o in m.Objects}
defobj = {str(i) for d in m.InstanceDefinitions for i in d.GetObjectIds()}
groups = collections.defaultdict(list)
def walk(o, X, layer):
    g = o.Geometry
    if type(g).__name__ == 'InstanceReference':
        d = idefs.get(str(g.ParentIdefId))
        if d:
            for oid in d.GetObjectIds():
                c = byid.get(str(oid))
                if c: walk(c, X @ load3dm._xf(g.Xform), layer)
        return
    for V, F, N in load3dm._geom_meshes(g):
        if len(V): groups[layer].append((np.c_[V, np.ones(len(V))] @ X.T)[:, :3])
for o in m.Objects:
    if str(o.Attributes.Id) in defobj: continue
    walk(o, np.eye(4), L[o.Attributes.LayerIndex].FullPath + ('' if L[o.Attributes.LayerIndex].Visible else ' (caché)'))
names = sorted(groups); allV = np.vstack([v for n in names for v in groups[n]]); lo, hi = allV.min(0), allV.max(0)
S = 260; tiles = []
for n in names:
    V = np.vstack(groups[n]); im = Image.new('RGB', (2 * S, S + 20), 'white'); d = ImageDraw.Draw(im)
    for k, (i, j) in enumerate(((0, 2), (1, 2))):
        sc = (S - 20) / max(hi - lo); p = V[:: max(1, len(V) // 40000)]
        x = (p[:, i] - lo[i]) * sc + 10 + k * S; y = S - 10 - (p[:, j] - lo[j]) * sc
        for a, b in zip(x, y): d.point((a, b), fill=(0, 0, 0))
    d.text((5, S + 4), f'{n}  ({len(groups[n])})', fill=(200, 0, 0)); tiles.append(im)
W = Image.new('RGB', (4 * S, ((len(tiles) + 1) // 2) * (S + 20)), 'white')
for k, t in enumerate(tiles): W.paste(t, ((k % 2) * 2 * S, (k // 2) * (S + 20)))
W.save(out); print(names)
