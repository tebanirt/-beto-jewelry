"""Lit un design MatrixGold (.3dm) : maillages de rendu du métal (métal + sertissage) et des pierres (blocs résolus)."""
import rhino3dm, numpy as np
METAL = ('Metal', 'Object::Setting', 'Extra')
SKIP = ('Object::Cutting', 'Object::Creation', 'Object::Finger', 'Render', 'User')
GEM = ('Gem',)

def _mesh_arrays(mesh):
    V = np.array([[v.X, v.Y, v.Z] for v in mesh.Vertices], float) if len(mesh.Vertices) else np.zeros((0, 3))
    N = np.array([[n.X, n.Y, n.Z] for n in mesh.Normals], float) if len(mesh.Normals) == len(mesh.Vertices) else None
    F = []
    for i in range(len(mesh.Faces)):
        f = mesh.Faces[i]
        if f[2] == f[3]: F.append([f[0], f[1], f[2]])
        else: F += [[f[0], f[1], f[2]], [f[0], f[2], f[3]]]
    return V, np.array(F, int).reshape(-1, 3), N

def _geom_meshes(g):
    t = type(g).__name__
    out = []
    if t == 'Mesh': out.append(_mesh_arrays(g))
    elif t == 'Brep':
        for fc in g.Faces:
            m = fc.GetMesh(rhino3dm.MeshType.Render)
            if m is not None: out.append(_mesh_arrays(m))
    elif t == 'Extrusion':
        m = g.GetMesh(rhino3dm.MeshType.Render)
        if m is not None: out.append(_mesh_arrays(m))
    return out

def _xf(T):
    return np.array([[T.M00, T.M01, T.M02, T.M03], [T.M10, T.M11, T.M12, T.M13], [T.M20, T.M21, T.M22, T.M23], [T.M30, T.M31, T.M32, T.M33]])

def load(path, metal_layers=None):
    """metal_layers : liste de préfixes de calques à prendre comme métal (fichier mal rangé), visibles ou non."""
    m = rhino3dm.File3dm.Read(path)
    layers = {i: m.Layers[i] for i in range(len(m.Layers))}
    def lname(o): return layers[o.Attributes.LayerIndex].FullPath if o.Attributes.LayerIndex in layers else '?'
    def lvisible(o):
        L = layers.get(o.Attributes.LayerIndex); return L is None or L.Visible
    idefs = {str(d.Id): d for d in m.InstanceDefinitions}
    byid = {str(o.Attributes.Id): o for o in m.Objects}
    parts = {'metal': [], 'gems': []}
    def emit(kind, meshes, X, layer):
        for V, F, N in meshes:
            if len(F) == 0: continue
            Vh = np.c_[V, np.ones(len(V))] @ X.T
            Nw = None
            if N is not None:
                Nw = N @ np.linalg.inv(X[:3, :3]).T; Nw /= np.maximum(np.linalg.norm(Nw, axis=1, keepdims=True), 1e-12)
            parts[kind].append({'V': Vh[:, :3], 'F': F, 'N': Nw, 'layer': layer})
    def walk(o, X, inherited=None):
        g = o.Geometry; t = type(g).__name__; layer = inherited or lname(o)
        if t == 'InstanceReference':
            d = idefs.get(str(g.ParentIdefId))
            if d is None: return
            Xi = X @ _xf(g.Xform)
            for oid in d.GetObjectIds():
                c = byid.get(str(oid))
                if c is not None: walk(c, Xi, layer)
            return
        if metal_layers:
            kind = 'gems' if layer.startswith(GEM) else ('metal' if layer.startswith(tuple(metal_layers)) else None)
            if kind: emit(kind, _geom_meshes(g), X, layer)
            return
        if layer.startswith(SKIP) or o.Attributes.Visible is False: return
        kind = 'gems' if layer.startswith(GEM) else ('metal' if layer.startswith(METAL) else None)
        if kind: emit(kind, _geom_meshes(g), X, layer)
    defobj = {str(i) for d in m.InstanceDefinitions for i in d.GetObjectIds()}
    def run(use_vis):
        for o in m.Objects:
            if str(o.Attributes.Id) in defobj: continue
            ln = lname(o)
            if use_vis and not ln.startswith(GEM) and not lvisible(o): continue
            walk(o, np.eye(4))
    # si le calque principal du métal est masqué, l'état visible n'est pas la bague finale : on prend tout le métal
    main_hidden = any(layers[i].FullPath == 'Metal::Metal 01' and not layers[i].Visible for i in layers)
    run(not main_hidden and not metal_layers)
    if not parts['metal']:
        parts['gems'].clear(); run(False)
    # même pièce en double sur deux calques visibles (ancienne et nouvelle version) : une seule gardée
    seen_p, keep_m = set(), []
    for x in parts['metal']:
        key = (len(x['V']), tuple(np.round(x['V'].min(0), 2)), tuple(np.round(x['V'].max(0), 2)))
        if key in seen_p: continue
        seen_p.add(key); keep_m.append(x)
    parts['metal'] = keep_m
    # pierres hors de la bague (bibliothèque de pierres posée à côté) : écartées
    if parts['metal'] and parts['gems']:
        from scipy.spatial import cKDTree
        tree = cKDTree(np.vstack([x['V'] for x in parts['metal']]))
        kept, seen = [], []
        for g in parts['gems']:
            c = g['V'].mean(0); size = float(np.ptp(g['V'], 0).max())
            if size < 0.6: continue  # reste de construction (aucune vraie pierre ne fait moins de 0,6 mm)
            # pierre posée sur la bague : un point de la pierre touche presque le métal
            dmin = tree.query(g['V'][:: max(1, len(g['V']) // 60)])[0].min()
            if dmin > 0.35: continue
            if any(np.linalg.norm(c - c2) < 0.3 * max(size, s2) and abs(size - s2) < 0.25 * max(size, s2) for c2, s2 in seen): continue
            if any(np.linalg.norm(c - c2) < 0.35 * (size + s2) for c2, s2 in seen if s2 < 3 and size < 3): continue  # petites pierres qui se chevauchent
            # orientation : chaque face tournée vers l'extérieur (pierre convexe ; blocs en miroir ou maillages mélangés)
            a, b, d = g['V'][g['F'][:, 0]], g['V'][g['F'][:, 1]], g['V'][g['F'][:, 2]]
            inward = np.einsum('ij,ij->i', np.cross(b - a, d - a), (a + b + d) / 3 - c) < 0
            g['F'][inward] = g['F'][inward][:, ::-1]
            kept.append(g); seen.append((c, size))
        parts['gems'] = kept
    # copie d'une pierre rangée sur un calque de métal (même boîte que la pierre) : ce n'est pas du métal
    if parts['gems']:
        gb = np.array([np.r_[g['V'].min(0), g['V'].max(0)] for g in parts['gems']])
        parts['metal'] = [x for x in parts['metal'] if not np.any(np.all(np.abs(gb - np.r_[x['V'].min(0), x['V'].max(0)]) < 0.05, axis=1))]
    return parts

if __name__ == '__main__':
    import sys, collections
    p = load(sys.argv[1])
    for k in p:
        allV = np.vstack([x['V'] for x in p[k]]) if p[k] else np.zeros((1, 3))
        print(k, 'morceaux', len(p[k]), 'triangles', sum(len(x['F']) for x in p[k]), 'bbox', np.round(allV.min(0), 2).tolist(), np.round(allV.max(0), 2).tolist(),
              dict(collections.Counter(x['layer'] for x in p[k])))
