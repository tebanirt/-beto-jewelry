"""Rendu studio d'un design MatrixGold (.3dm) de Rayane."""
import sys, math, numpy as np, argparse
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import scene, load3dm, bpy, os as _os
from mathutils import Matrix
argv = sys.argv[sys.argv.index('--') + 1:]
ap = argparse.ArgumentParser(); ap.add_argument('path'); ap.add_argument('out'); ap.add_argument('--metal', default='blanc')
ap.add_argument('--view', default='hero'); ap.add_argument('--res', type=int, default=800); ap.add_argument('--samples', type=int, default=128)
ap.add_argument('--dist', type=float, default=None); ap.add_argument('--fire', action='store_true'); ap.add_argument('--center', default='diamond'); ap.add_argument('--hdri', default=None); ap.add_argument('--rot', type=float, default=0); ap.add_argument('--strength', type=float, default=1.0); ap.add_argument('--exposure', type=float, default=0.0); ap.add_argument('--regem', action='store_true'); ap.add_argument('--tint', default=None); ap.add_argument('--finish', action='store_true'); ap.add_argument('--border', default=None); ap.add_argument('--nodenoise', action='store_true'); ap.add_argument('--mask', action='store_true'); ap.add_argument('--gempost', default=None); ap.add_argument('--layers', default=None); ap.add_argument('--shape', default=None); ap.add_argument('--ct', type=float, default=2.0); ap.add_argument('--rotate', type=float, default=0.0); ap.add_argument('--gempass', action='store_true'); ap.add_argument('--turntable', type=int, default=0); ap.add_argument('--gemmatch', type=float, default=0.0); ap.add_argument('--prongs', default=None); ap.add_argument('--crop', default=None)
a = ap.parse_args(argv)
scene.reset()
P = load3dm.load(a.path, a.layers.split(',') if a.layers else None)
if a.crop:  # fichier qui contient d'autres objets (support, deuxième jonc) : seule la bague, dans cette boîte (axe:min:max)
    lim = {ax: tuple(float(v) for v in r.split(':')) for ax, *r in [c.split(':', 1) for c in a.crop.split(',')]}
    def inside(x):
        lo, hi = x['V'].min(0), x['V'].max(0)
        return all(lo['xyz'.index(ax)] >= mn and hi['xyz'.index(ax)] <= mx for ax, (mn, mx) in lim.items())
    P['metal'] = [x for x in P['metal'] if inside(x)]; P['gems'] = [x for x in P['gems'] if inside(x)]
if a.shape:  # tête de Rayane adaptée à une autre forme de pierre
    import reshape
    info = reshape.reshape(P, a.shape, ct=a.ct, rotate_deg=a.rotate); print('nouvelle pierre', a.shape, a.ct, 'ct', round(info['L'], 2), 'x', round(info['W'], 2), 'mm')
mm = scene.mat_metal(a.metal); dm = scene.mat_diamond()
caps = []
if a.finish:
    import finish as FIN
    caps = FIN.finish(P['metal'], P['gems'], prong_style=a.prongs)
    print('bouts arrondis', len(caps))
allV = np.vstack([x['V'] for x in P['metal'] + P['gems']]); lo, hi = allV.min(0), allV.max(0)
for k, x in enumerate(P['metal']):
    ob = scene.mesh_obj(f'metal_{k}', x['V'], x['F'], x['N'], mm, smooth=True)
    if x.get('resharp'):
        try: ob.data.set_sharp_from_angle(angle=math.radians(35))
        except Exception as e: print('angle', e)
for k, (ctr, rad) in enumerate(caps):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=rad, segments=32, ring_count=16, location=tuple(ctr))
    s_ = bpy.context.object; s_.data.materials.append(mm); s_.data.shade_smooth()
import brilliant as BR, gems as GM
big = max(P['gems'], key=lambda x: np.ptp(x['V'], 0).max()) if P['gems'] else None
for k, x in enumerate(P['gems']):
    if _os.environ.get('BETO_ONLY_CENTER') and x is not big: continue  # diagnostic : pierre centrale seule
    V, F = x['V'], x['F']
    if a.regem and x is big:
        import finish as FIN
        fr = FIN.gem_frame(V); h = fr['h']; c = fr['c']
        d = V - c; pl = d - np.outer(d @ h, h)
        _, _, Wp = np.linalg.svd(pl, full_matrices=False); l_ax = Wp[0]; w_ax = np.cross(h, l_ax)
        L = np.ptp(pl @ l_ax); Wd = np.ptp(pl @ w_ax)
        shape = 'ovale' if L / Wd > 1.12 else 'rond'
        G, GF = GM.gem(shape); G = G.copy()
        G[:, 0] *= Wd / np.ptp(G[:, 0]); G[:, 1] *= L / np.ptp(G[:, 1])
        gz_top = G[:, 2].max(); gz_bot = G[:, 2].min()
        up = G[:, 2] > 0
        G[up, 2] *= (fr['top'] - fr['girdle']) / gz_top; G[~up, 2] *= (fr['girdle'] - fr['bot']) / -gz_bot
        V = c + np.outer(G[:, 0], w_ax) + np.outer(G[:, 1], l_ax) + np.outer(G[:, 2] + fr['girdle'], h); F = GF
        if np.dot(np.cross(w_ax, l_ax), h) < 0: F = F[:, ::-1]
    gm = dm
    if a.tint and x is big:
        gm = scene.mat_diamond(tuple(float(v) for v in a.tint.split(',')))
    scene.mesh_obj(f'gem_{k}', V, F, None, gm, smooth=False)
cz = (lo[2] + hi[2]) / 2 * 0.55 + lo[2] * 0.0
rc = ((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2 - 0.08 * (hi[2] - lo[2]))
if a.dist is None:  # cadrage automatique : la bague occupe ~72 % de l'image, avec de l'air autour
    a.dist = max(62.0, float(_os.environ.get('BETO_FRAME', 3.4)) * float(np.max(hi - lo)))
if a.hdri: scene.studio_hdri(a.hdri, a.view, a.res, a.samples, ring_center=rc, dist=a.dist, strength=a.strength, rot=a.rot, exposure=a.exposure)
else: scene.studio(a.view, a.res, a.samples, ring_center=rc, dist=a.dist)
sc = bpy.context.scene
def autofit(fill):
    """Recul de la caméra et décentrement de l'objectif selon la silhouette projetée de la bague, pour chaque vue."""
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector
    cam = sc.camera; tgt = Vector(rc); total = 1.0
    pts = []
    for o in sc.objects:
        if o.type == 'MESH' and o.name.startswith(('metal_', 'gem_', 'Sphere')):
            vs = o.data.vertices; st = max(1, len(vs) // 400)
            pts += [o.matrix_world @ vs[i].co for i in range(0, len(vs), st)]
    if _os.environ.get('BETO_FOCUS') == 'tete' and big is not None:  # gros plan sur la tête (revue des griffes)
        bc = Vector(big['V'].mean(0)); br = float(np.ptp(big['V'], 0).max())
        pts = [p for p in pts if (p - bc).length < 0.85 * br]
    for _ in range(4):
        bpy.context.view_layer.update()
        q = [world_to_camera_view(sc, cam, p) for p in pts]
        ext = max(max(v.x for v in q) - min(v.x for v in q), max(v.y for v in q) - min(v.y for v in q))
        f = ext / fill; total *= f; cam.location = tgt + (cam.location - tgt) * f
    bpy.context.view_layer.update()
    q = [world_to_camera_view(sc, cam, p) for p in pts]
    cam.data.shift_x = (max(v.x for v in q) + min(v.x for v in q)) / 2 - 0.5
    cam.data.shift_y = (max(v.y for v in q) + min(v.y for v in q)) / 2 - 0.5 + 0.03  # un peu d'air sous la bague pour l'ombre
    for o in sc.objects:  # panneaux liés à la position de l'objectif
        if o.name.startswith(('hkey', 'hphoto')): o.location = tgt + (o.location - tgt) * total
    return (cam.location - tgt).length
FILL = float(_os.environ.get('BETO_FILL', 0.80))
camd = autofit(FILL) if a.view != 'tete' else a.dist
MKEY = float(_os.environ.get('BETO_MKEY', 1.5))
if MKEY > 0:  # boîte à lumière derrière l'objectif pour le métal seulement : bouts de griffes et jonc brillants
    from mathutils import Vector
    km = bpy.data.materials.new('mkey'); km.use_nodes = True; kn = km.node_tree
    for n in list(kn.nodes):
        if n.type != 'OUTPUT_MATERIAL': kn.nodes.remove(n)
    em = kn.nodes.new('ShaderNodeEmission'); em.inputs[1].default_value = MKEY; kn.links.new(em.outputs[0], kn.nodes['Material Output'].inputs['Surface'])
    tg = Vector(rc); loc = tg + (sc.camera.location - tg) * 1.3
    mk_ = scene._panel('hmetal', tuple(loc), (0.55 * camd, 0.40 * camd), km, tuple(tg))
    mk_.visible_diffuse = False; mk_.visible_transmission = False; mk_.visible_volume_scatter = False
TENT = float(_os.environ.get('BETO_TENT', 0))
if TENT > 0:  # tente de lumière (photo joaillerie) : le métal reflète surtout du blanc doux, avec des coutures sombres
    from mathutils import Vector
    tm = bpy.data.materials.new('tent'); tm.use_nodes = True; tn = tm.node_tree
    for n in list(tn.nodes):
        if n.type != 'OUTPUT_MATERIAL': tn.nodes.remove(n)
    te = tn.nodes.new('ShaderNodeEmission'); te.inputs[1].default_value = TENT; tn.links.new(te.outputs[0], tn.nodes['Material Output'].inputs['Surface'])
    tg = Vector(rc); cv = sc.camera.location - tg; az0 = math.atan2(cv.y, cv.x)
    panels = [(45, 30, 1.0), (135, 30, 1.0), (225, 30, 1.0), (315, 30, 1.0), (0, 85, 1.2), (180, 10, 0.8)]
    if _os.environ.get('BETO_TENT_BACK', '1') != '0':  # boîte à lumière derrière la bague, en hauteur : dessus plats (griffes, jonc) jamais noirs
        panels += [(180, 40, 0.75), (180, 64, 0.75)]
    for k, (daz, el, sz) in enumerate(panels):
        az = az0 + math.radians(daz); e = math.radians(el); R_ = 1.25 * camd
        loc = tg + Vector((R_ * math.cos(e) * math.cos(az), R_ * math.cos(e) * math.sin(az), R_ * math.sin(e)))
        pn = scene._panel(f'hmetal_tent{k}', tuple(loc), (0.95 * sz * camd, 0.7 * sz * camd), tm, tuple(tg))
        pn.visible_diffuse = False; pn.visible_transmission = False; pn.visible_volume_scatter = False
if a.nodenoise: sc.cycles.use_denoising = False
if a.border:
    b = [float(v) for v in a.border.split(',')]
    sc.render.use_border = True; sc.render.use_crop_to_border = True
    sc.render.border_min_x, sc.render.border_min_y, sc.render.border_max_x, sc.render.border_max_y = b[0], 1 - b[3], b[2], 1 - b[1]
STUDIO = ('hstrip', 'hside', 'hspark', 'hcard', 'hkey', 'hphoto')
def _emat(nm, c):
    m = bpy.data.materials.get(nm)
    if m: return m
    m = bpy.data.materials.new(nm); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = (c, c, c, 1); e.inputs[1].default_value = 1
    nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface']); return m

def _render(path):
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)

def render_frame(out):
    """Passe principale, passe des pierres, masque, retouche des pierres, fond blanc. L'état de la scène est rétabli."""
    raw = out.replace('.png', '_raw.png')
    full_glossy = sc.cycles.glossy_bounces
    if a.gempass:  # passe du métal : peu de rebonds (creux du pavé sombres, pas orange) ; les pierres viennent de leur passe
        sc.cycles.glossy_bounces = int(_os.environ.get('BETO_MAIN_GLOSSY', 5))
    if a.fire:
        from PIL import Image
        ch = []
        for k, ior in enumerate((2.407, 2.419, 2.451)):
            dm.node_tree.nodes['glass'].inputs['IOR'].default_value = ior
            f = raw.replace('_raw', f'_ch{k}'); _render(f); ch.append(Image.open(f).convert('RGBA').split())
        dm.node_tree.nodes['glass'].inputs['IOR'].default_value = scene.DIAMOND_IOR
        Image.merge('RGBA', (ch[0][0], ch[1][1], ch[2][2], ch[1][3])).save(raw)
    else:
        _render(raw)
    sc.cycles.glossy_bounces = full_glossy
    gemraw = None
    if a.gempass:  # passe des pierres : même les reflets extérieurs voient le studio du diamant (pas le softbox du métal)
        from bpy_extras.object_utils import world_to_camera_view
        from mathutils import Vector
        pts = [world_to_camera_view(sc, sc.camera, o.matrix_world @ v.co) for o in sc.objects if o.name.startswith('gem_') for v in o.data.vertices]
        if not pts: pts = [Vector((0, 0, 0)), Vector((1, 1, 0))]  # bague sans pierre : passe des pierres sur toute l'image
        xs = [q.x for q in pts]; ys = [q.y for q in pts]
        bx0, bx1, by0, by1 = max(0, min(xs) - 0.01), min(1, max(xs) + 0.01), max(0, min(ys) - 0.01), min(1, max(ys) + 0.01)
        R = sc.render; keep = (R.use_border, R.use_crop_to_border, R.border_min_x, R.border_min_y, R.border_max_x, R.border_max_y)
        if not keep[0] or not keep[1]:
            R.use_border = True; R.use_crop_to_border = False
            R.border_min_x, R.border_max_x, R.border_min_y, R.border_max_y = bx0, bx1, by0, by1
        vis = {o.name: o.visible_glossy for o in sc.objects if o.name.startswith(STUDIO)}
        for o in sc.objects:  # les reflets de la couronne voient aussi les bandes et les cartons du studio du diamant
            if o.name in vis and _os.environ.get('GEMPASS_GLOSSY') == '1': o.visible_glossy = True
        wt = sc.world.node_tree; saved = []
        for n in wt.nodes:
            if n.type == 'MIX_SHADER':
                for lk in list(n.inputs[0].links): saved.append((lk.from_socket, n.inputs[0])); wt.links.remove(lk)
                n.inputs[0].default_value = 1.0
        hm = [o for o in sc.objects if o.name.startswith('hmetal')]
        for o in hm: o.hide_render = True
        spp0 = sc.cycles.samples; sc.cycles.samples = int(spp0 * float(_os.environ.get('BETO_GEM_SPP', 1.0)))  # pierres : plus d'échantillons (moins de grain)
        gemraw = raw.replace('_raw', '_gem'); _render(gemraw)
        sc.cycles.samples = spp0
        for o in hm: o.hide_render = False
        for fs, ts in saved: wt.links.new(fs, ts)
        for o in sc.objects:
            if o.name in vis: o.visible_glossy = vis[o.name]
        (R.use_border, R.use_crop_to_border, R.border_min_x, R.border_min_y, R.border_max_x, R.border_max_y) = keep
    if a.mask or a.gempost or a.gemmatch:  # masque des pierres (vues par l'objectif), pour la retouche des pierres seulement
        W_, K_ = _emat('mw', 1.0), _emat('mk', 0.0)
        mats = {}
        for o in sc.objects:
            if o.type == 'MESH' and o.data.materials:
                mats[o.name] = list(o.data.materials)
                for i in range(len(o.data.materials)): o.data.materials[i] = W_ if o.name.startswith('gem_') else K_
        cy = sc.cycles; vs = sc.view_settings; bgs = sc.world.node_tree.nodes['Background'].inputs['Strength']
        keep = (cy.samples, cy.use_denoising, vs.view_transform, vs.exposure, vs.look, bgs.default_value)
        cy.samples = 16; cy.use_denoising = False; vs.view_transform = 'Standard'; vs.exposure = 0; vs.look = 'None'; bgs.default_value = 0
        mk = out.replace('.png', '_mask.png'); _render(mk)
        cy.samples, cy.use_denoising, vs.view_transform, vs.exposure = keep[:4]; vs.look = keep[4]; bgs.default_value = keep[5]
        for o in sc.objects:
            if o.name in mats:
                for i, m in enumerate(mats[o.name]): o.data.materials[i] = m
        if a.gemmatch:
            import gempost; gempost.apply_match(raw, mk, raw, gemsrc=gemraw, strength=a.gemmatch, neutral=0.0 if a.tint else 0.7)
        elif a.gempost:
            import gempost; gempost.apply(raw, mk, raw, *[float(v) for v in a.gempost.split(',')], gemsrc=gemraw)
    scene.composite_white(raw, out, contact=bool(a.hdri))

if a.turntable:  # 360° : la bague tourne sur elle-même devant un studio fixe (reflets qui bougent, comme en photo)
    import os
    piv = bpy.data.objects.new('pivot', None); sc.collection.objects.link(piv); piv.location = rc
    for o in list(sc.objects):
        if o.type == 'MESH' and (o.name.startswith(('metal_', 'gem_')) or o.name.startswith('Sphere')):
            o.parent = piv; o.matrix_parent_inverse = piv.matrix_world.inverted()
    os.makedirs(a.out, exist_ok=True)
    for k in range(a.turntable):
        piv.rotation_euler = (0, 0, 2 * math.pi * k / a.turntable); bpy.context.view_layer.update()
        f = os.path.join(a.out, f'{k:03d}.png')
        if os.path.exists(f): continue
        render_frame(f); print('image', k, flush=True)
    print('rendu', a.out)
else:
    render_frame(a.out); print('rendu', a.out, 'métal', len(P['metal']), 'pierres', len(P['gems']))
