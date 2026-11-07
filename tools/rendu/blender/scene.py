"""Scène de rendu photoréaliste Beto Jewelry (Blender Cycles), à partir des modèles CAO de Rayane."""
import sys, math, json, argparse, numpy as np, bpy
from mathutils import Matrix, Vector
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import decode, brilliant as BR
_BR = None
def brilliant_for(bb):
    global _BR
    if _BR is None:
        V, F, zt = BR.brilliant(); _BR = (V, BR.oriented(V, F), zt)
    V, F, zt = _BR; V = V.copy()
    V[:, 0] *= bb[3]; V[:, 1] *= bb[4]
    zmin = V[:, 2].min()
    up = V[:, 2] > 0
    V[up, 2] *= bb[5] / zt
    V[~up, 2] *= abs(bb[2]) / abs(zmin)
    return V, F

METALS = {  # couleurs de réflectance mesurées (approx. F0 sRGB linéaire)
    'blanc': ((0.86, 0.85, 0.83), (0.97, 0.97, 0.96)),
    'jaune': ((1.0, 0.71, 0.29), (1.0, 0.86, 0.52)),
    'rose':  ((0.93, 0.60, 0.50), (1.0, 0.82, 0.76)),
    'platine': ((0.80, 0.79, 0.77), (0.95, 0.95, 0.94)),
}

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

THROUGH_GEM_DESAT = 1.0
def mat_metal(name):
    if _os.environ.get('BETO_' + name.upper()):  # réglage de couleur à l'essai
        METALS[name] = (tuple(float(v) for v in _os.environ['BETO_' + name.upper()].split(',')), METALS[name][1])
    m = bpy.data.materials.new('metal'); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF'] if 'Principled BSDF' in nt.nodes else nt.nodes.new('ShaderNodeBsdfPrincipled')
    base, spec = METALS[name]
    b.inputs['Base Color'].default_value = (*base, 1)
    b.inputs['Metallic'].default_value = 1.0
    b.inputs['Roughness'].default_value = 0.07
    if 'Specular Tint' in b.inputs: b.inputs['Specular Tint'].default_value = (*spec, 1)
    out = nt.nodes.get('Material Output') or nt.nodes.new('ShaderNodeOutputMaterial')
    # métal vu à travers une pierre : couleur adoucie (comme sous l'éclairage fort d'un studio photo)
    lp = nt.nodes.new('ShaderNodeLightPath'); gt = nt.nodes.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = 0.5
    nt.links.new(lp.outputs['Transmission Depth'], gt.inputs[0])
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mfac = nt.nodes.new('ShaderNodeMath'); mfac.operation = 'MULTIPLY'; mfac.inputs[1].default_value = THROUGH_GEM_DESAT
    nt.links.new(gt.outputs[0], mfac.inputs[0]); nt.links.new(mfac.outputs[0], mix.inputs['Factor'])
    mix.inputs['A'].default_value = (*base, 1); mix.inputs['B'].default_value = (0.80, 0.80, 0.79, 1)
    nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    nt.links.new(b.outputs[0], out.inputs['Surface'])
    return m

DIAMOND_IOR = 2.417
def mat_diamond(color=(1, 1, 1)):
    m = bpy.data.materials.new('diamond'); m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
    out = nt.nodes.get('Material Output') or nt.nodes.new('ShaderNodeOutputMaterial')
    g = nt.nodes.new('ShaderNodeBsdfGlass'); g.name = 'glass'
    g.inputs['Color'].default_value = (*color, 1); g.inputs['Roughness'].default_value = 0.0; g.inputs['IOR'].default_value = DIAMOND_IOR
    nt.links.new(g.outputs[0], out.inputs['Surface'])
    return m

def mesh_obj(name, P, I, N=None, mat=None, smooth=True):
    me = bpy.data.meshes.new(name)
    me.from_pydata(P.tolist(), [], I.tolist())
    me.update()
    if smooth:
        me.shade_smooth()
        if N is not None:
            try: me.normals_split_custom_set_from_vertices(N.tolist())
            except Exception as e: print('normals', e)
    else:
        me.shade_flat()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    if mat: me.materials.append(mat)
    return ob

USE_BRILLIANT = True
PAVE = False
BAND_PROFILE = __file__.rsplit('/', 2)[0] + '/profile_sol4.npy'
KEY_SIZE, KEY_E, PHOTOG = 70, 4.0, 40
WORLD = 0.18
VIEW_TRANSFORM = 'AgX'
CARDS = [(-60, -75, 95), (60, -75, 95), (0, 70, 115), (-100, 20, 55), (100, 20, 55), (-45, -110, 40), (45, -110, 40), (-75, 75, 80), (75, 75, 80)]
CARD = 34
SHADOW_W = 4e5
HEAD_SCALE = 0.85
WORLD_GEM = 0.03
import os as _os
GEM_SEES_TOP = False
KEY_IN_GEM = False
if _os.environ.get('BETO_GEMLIGHT') == 'bright':
    GEM_SEES_TOP, KEY_IN_GEM, WORLD_GEM, PHOTOG = True, True, 0.12, 22
GEM_STRIPS, GEM_STRIP_E = 10, 25.0
Y_UP = Matrix(((1, 0, 0, 0), (0, 0, -1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))  # (x, y, z) -> (x, -z, y)

def _catmull_closed(P, per=6):
    P = np.asarray(P); n = len(P); out = []
    for i in range(n):
        p0, p1, p2, p3 = P[i - 1], P[i], P[(i + 1) % n], P[(i + 2) % n]
        for t in np.linspace(0, 1, per, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return np.array(out)

def band_from_profile(profile, mat, segments=720):
    """Jonc parfaitement lisse : révolution du profil mesuré sur le modèle de Rayane."""
    prof = _catmull_closed(profile, 6); m = len(prof)
    th = np.linspace(0, 2 * np.pi, segments, endpoint=False)
    P = np.array([[r * math.cos(a), r * math.sin(a), z] for a in th for (r, z) in prof])
    F = []
    for i in range(segments):
        i2 = (i + 1) % segments
        for j in range(m):
            j2 = (j + 1) % m
            F.append([i * m + j, i2 * m + j, i2 * m + j2, i * m + j2])
    me = bpy.data.meshes.new('band'); me.from_pydata(P.tolist(), [], F); me.update()
    me.shade_smooth()
    ob = bpy.data.objects.new('band', me); bpy.context.scene.collection.objects.link(ob); me.materials.append(mat)
    if sum(1 for f in me.polygons if f.normal.dot(f.center) < 0) > len(me.polygons) / 2: me.flip_normals()
    return ob

def build_ring(model_path, metal='blanc', prong='rondes'):
    d = decode.load(model_path)
    mm = mat_metal(metal); dm = mat_diamond()
    root = bpy.data.objects.new('ring', None); bpy.context.scene.collection.objects.link(root)
    for k, p in enumerate(d['parts']):
        v = p['meta'].get('variant')
        if (prong == 'eagle') != (v == 'eagle') and p['meta']['role'] == 'prong':
            continue
        if p['meta']['role'] != 'band' and HEAD_SCALE != 1:
            p = dict(p); P = p['P'].copy(); P[:, 1] = 10.05 + (P[:, 1] - 10.05) * HEAD_SCALE; P[:, 0] *= HEAD_SCALE; P[:, 2] *= HEAD_SCALE; p['P'] = P
        if p['meta']['role'] == 'band' and BAND_PROFILE is not None:
            ob = band_from_profile(np.load(BAND_PROFILE.replace('.npy', '_pave.npy') if PAVE else BAND_PROFILE), mm)
        else:
            ob = mesh_obj(f"metal_{k}", p['P'], p['I'], p['N'], mm)
        ob['role'] = p['meta']['role']
        ob.parent = root
    for k, g in enumerate(d['gems']):
        df = d['defs'][g['defn']]
        M = np.vstack([g['m'], [0, 0, 0, 1]])
        if HEAD_SCALE != 1:
            S = np.diag([HEAD_SCALE] * 3 + [1.0]); S[1, 3] = 10.05 * (1 - HEAD_SCALE); M = S @ M
        GP, GI = brilliant_for(df['bb']) if USE_BRILLIANT else (df['P'], df['I'])
        ob = mesh_obj(f"gem_{k}_{g['defn']}", GP, GI, None, dm, smooth=False)
        ob.matrix_world = Matrix(M.tolist())
        ob.parent = root
    if PAVE: print('pavé', add_pave(root, mm, dm))
    root.matrix_world = Y_UP
    bpy.context.view_layer.update()
    return d

def _emit_mat(name, energy, color=(1, 1, 1)):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL': nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = (*color, 1); e.inputs[1].default_value = energy
    nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m

def _panel(name, loc, size, mat, target):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    o = bpy.context.object; o.name = name; o.scale = (size[0], size[1], 1)
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    o.data.materials.append(mat); o.visible_camera = False; o.visible_shadow = False
    return o

def add_pave(root, mm, dm, start=76.5, end=-6.0, d=1.40, gap=0.06, R=10.05, sink=0.05, bead_r=0.19):
    """Semi-éternité : petits diamants sertis à grains partagés sur le dessus du jonc, des deux côtés de la tête."""
    V, F, zt = BR.brilliant(); F = BR.oriented(V, F); r = d / 2
    pitch = math.degrees((d + gap) / R)
    angles = []
    a = start
    while a >= end - 1e-6: angles.append(a); a -= pitch
    n = 0
    import bmesh
    cut_bm = bmesh.new()
    for side in (1, -1):
        for a in angles:
            th = math.radians(90 + side * (90 - a))
            u = np.array([math.cos(th), math.sin(th), 0.0])  # radial
            t = np.array([-math.sin(th), math.cos(th), 0.0])  # tangente
            w = np.array([0.0, 0.0, 1.0])                     # largeur du jonc
            M = np.eye(4); M[:3, 0] = w * r; M[:3, 1] = t * r; M[:3, 2] = u * r; M[:3, 3] = u * (R - sink)
            ob = mesh_obj(f'pave_{n}', V, F, None, dm, smooth=False); ob.matrix_world = Matrix(M.tolist()); ob.parent = root; n += 1
            # siège percé : cylindre au diamètre de la pierre au-dessus du rondiste, cône pour le pavillon
            Mc = np.eye(4); Mc[:3, 0] = w; Mc[:3, 1] = t; Mc[:3, 2] = u; Mc[:3, 3] = u * (R - sink)
            res = bmesh.ops.create_cone(cut_bm, cap_ends=True, segments=40, radius1=r * 0.99, radius2=r * 0.99, depth=1.6,
                                        matrix=Matrix(Mc.tolist()) @ Matrix.Translation((0, 0, 0.8)))
            bmesh.ops.create_cone(cut_bm, cap_ends=True, segments=40, radius1=r * 0.15, radius2=r * 0.99, depth=r * 0.9,
                                  matrix=Matrix(Mc.tolist()) @ Matrix.Translation((0, 0, -r * 0.45)))
        # grains entre les pierres (et aux extrémités)
        bead_angles = [angles[0] + pitch / 2] + [x - pitch / 2 for x in angles]
        for a in bead_angles:
            th = math.radians(90 + side * (90 - a))
            for zz in (-(r * 0.80), r * 0.80):
                bpy.ops.mesh.primitive_uv_sphere_add(radius=bead_r, segments=32, ring_count=16, location=(0, 0, 0))
                b = bpy.context.object; b.data.materials.append(mm); b.data.shade_smooth()
                rr = R - 0.03 - 0.06 * (abs(zz) / 0.8) ** 2   # posé sur le dessus du jonc
                pos = np.array([math.cos(th) * rr, math.sin(th) * rr, zz])
                b.matrix_world = Matrix.Translation(Vector(pos.tolist())); b.parent = root
    me = bpy.data.meshes.new('cutters'); cut_bm.to_mesh(me); cut_bm.free()
    cutter = bpy.data.objects.new('cutters', me); bpy.context.scene.collection.objects.link(cutter)
    cutter.parent = root; cutter.hide_render = True; cutter.display_type = 'WIRE'
    for ob in [o for o in bpy.data.objects if o.get('role') == 'band']:
        mod = ob.modifiers.new('sieges', 'BOOLEAN'); mod.operation = 'DIFFERENCE'; mod.object = cutter; mod.solver = 'EXACT'; mod.use_self = True
    return n

def studio(view='face', res=1400, samples=256, ring_center=(0, 0, 3.5), dist=None):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
    sc.cycles.samples = samples; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 40; sc.cycles.transmission_bounces = 32; sc.cycles.glossy_bounces = 24
    sc.cycles.transparent_max_bounces = 16; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 0.0; sc.cycles.sample_clamp_indirect = 20
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.film_transparent = True
    sc.view_settings.view_transform = VIEW_TRANSFORM; sc.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in [i.identifier for i in sc.view_settings.bl_rna.properties['look'].enum_items] else 'None'
    sc.view_settings.exposure = 0.35
    # Monde : studio sombre pour les reflets (les caméras ne le voient pas : fond composité ensuite)
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; wt = w.node_tree
    bg = wt.nodes['Background']; bg.inputs[0].default_value = (0.9, 0.9, 0.9, 1); bg.inputs[1].default_value = WORLD
    # fond sombre pour les rayons qui ont traversé une pierre (contraste des facettes), clair pour le métal
    lp = wt.nodes.new('ShaderNodeLightPath'); gt = wt.nodes.new('ShaderNodeMath'); gt.operation = 'GREATER_THAN'; gt.inputs[1].default_value = 0.5
    wt.links.new(lp.outputs['Transmission Depth'], gt.inputs[0])
    dark = wt.nodes.new('ShaderNodeBackground'); dark.inputs[0].default_value = (1, 1, 1, 1); dark.inputs[1].default_value = WORLD_GEM
    mix = wt.nodes.new('ShaderNodeMixShader'); wt.links.new(gt.outputs[0], mix.inputs[0]); wt.links.new(bg.outputs[0], mix.inputs[1]); wt.links.new(dark.outputs[0], mix.inputs[2])
    wt.links.new(mix.outputs[0], wt.nodes['World Output'].inputs['Surface'])
    # Sol : attrape-ombre (ombre douce sur fond blanc)
    bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -10.55))
    floor = bpy.context.object; floor.is_shadow_catcher = True; floor.visible_transmission = False
    T = ring_center
    big = _emit_mat('soft', 4.0); strip = _emit_mat('strip', 14.0); spark = _emit_mat('spark', 60.0); rim = _emit_mat('rim', 6.0)
    black = bpy.data.materials.new('black'); black.use_nodes = True
    bb = black.node_tree.nodes['Principled BSDF']; bb.inputs['Base Color'].default_value = (0.005, 0.005, 0.005, 1); bb.inputs['Roughness'].default_value = 0.25
    tp = _panel('top', (0, 10, 150), (110, 110), big, T); tp.visible_transmission = GEM_SEES_TOP
    _panel('strip_l', (-95, -20, 60), (14, 120), strip, T)
    _panel('strip_r', (95, -20, 60), (14, 120), strip, T)
    _panel('strip_bl', (-70, 90, 45), (14, 90), strip, T)
    _panel('strip_br', (70, 90, 45), (14, 90), strip, T)
    for o in (_panel('rim', (0, 140, 15), (160, 25), rim, T), _panel('front_low', (0, -150, 5), (120, 18), rim, T)):
        o.visible_transmission = False
    # petites sources vives tout autour = scintillement
    for k in range(28):
        a = 2 * math.pi * k / 28; r = 85; z = 55 + 35 * math.sin(3 * a)
        _panel(f'spark_{k}', (r * math.cos(a), r * math.sin(a), z), (2.2, 2.2), spark, T)
    # couronne de bandes fines vues seulement à travers les pierres (éclat / brillance)
    gl = _emit_mat('gemlight', GEM_STRIP_E)
    for k in range(GEM_STRIPS):
        a = 2 * math.pi * (k + 0.5) / GEM_STRIPS; r = 80
        o = _panel(f'gemstrip_{k}', (r * math.cos(a), r * math.sin(a), 75), (5, 60), gl, T)
        o.visible_glossy = False; o.visible_diffuse = False
    # cartes noires (contraste des facettes)
    for k, (x, y, z) in enumerate(CARDS):
        c = _panel(f'card_{k}', (x, y, z), (CARD, CARD), black, T)
        c.visible_glossy = False; c.visible_diffuse = False  # vus seulement à travers les pierres
    # ombre de contact douce
    ld = bpy.data.lights.new('ombre', 'AREA'); ld.size = 60; ld.energy = SHADOW_W
    lo = bpy.data.objects.new('ombre', ld); sc.collection.objects.link(lo); lo.location = (0, -10, 160)
    lo.visible_glossy = False; lo.visible_transmission = False
    cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 105; cam_d.clip_start = 1; cam_d.clip_end = 3000
    cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
    views = {'epaule': (-25, 60, 32), 'hero': (0, 66, 88), 'face': (0, 30, 92), 'trois_quarts': (-35, 26, 96), 'cote': (90, 4, 92), 'dessus': (0, 88, 88), 'profil_tete': (90, 18, 60)}
    az, el, dd = views[view]
    dd = dist or dd
    a, e = math.radians(az), math.radians(el)
    target = Vector(T)
    cam.location = target + Vector((dd*math.cos(e)*math.sin(a), -dd*math.cos(e)*math.cos(a), dd*math.sin(e)))
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    # Boîte à lumière derrière l'objectif + silhouette sombre du photographe (motif des flèches)
    back = target + (cam.location - target) * 2.4
    kb = _panel('key_behind_cam', tuple(back), (KEY_SIZE, KEY_SIZE), _emit_mat('key', KEY_E), T)
    kb.visible_transmission = KEY_IN_GEM
    ph = _panel('photographer', tuple(target + (cam.location - target) * 1.15), (PHOTOG, PHOTOG), black, T)
    ph.visible_glossy = False; ph.visible_diffuse = False
    return cam


GEM_HYBRID = _os.environ.get('BETO_HYBRID', '1') == '1'
KEY_PENDING = []
HYB_DARK, HYB_STRIP, HYB_SPARK = float(_os.environ.get('HYB_DARK', 0.07)), float(_os.environ.get('HYB_STRIP', 45)), float(_os.environ.get('HYB_SPARK', 110))
def studio_hdri(hdri, view='hero', res=800, samples=128, ring_center=(0, 0, 3.5), dist=None, strength=1.0, rot=0.0, exposure=0.0):
    """Studio photographié (HDRI) : le métal et les pierres reflètent un vrai studio ; fond blanc composité, ombre de contact."""
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = samples; sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 40; sc.cycles.transmission_bounces = 32; sc.cycles.glossy_bounces = 24
    sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False; sc.cycles.sample_clamp_indirect = 20
    sc.render.resolution_x = sc.render.resolution_y = res; sc.render.film_transparent = True
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = exposure
    if _os.environ.get('BETO_LOOK'): sc.view_settings.look = _os.environ['BETO_LOOK']
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; wt = w.node_tree
    bg = wt.nodes['Background']; env = wt.nodes.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(hdri)
    mp = wt.nodes.new('ShaderNodeMapping'); tc = wt.nodes.new('ShaderNodeTexCoord'); mp.inputs['Rotation'].default_value = (0, 0, math.radians(rot))
    wt.links.new(tc.outputs['Generated'], mp.inputs['Vector']); wt.links.new(mp.outputs['Vector'], env.inputs['Vector']); wt.links.new(env.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = strength
    if GEM_HYBRID:
        # à travers les pierres : fond sombre + bandes, points vifs, cartons noirs (contraste des facettes)
        lp = wt.nodes.new('ShaderNodeLightPath'); gtn = wt.nodes.new('ShaderNodeMath'); gtn.operation = 'GREATER_THAN'; gtn.inputs[1].default_value = 0.5
        wt.links.new(lp.outputs['Transmission Depth'], gtn.inputs[0])
        dk = wt.nodes.new('ShaderNodeBackground'); dk.inputs[0].default_value = (1, 1, 1, 1); dk.inputs[1].default_value = HYB_DARK
        mx = wt.nodes.new('ShaderNodeMixShader'); wt.links.new(gtn.outputs[0], mx.inputs[0]); wt.links.new(bg.outputs[0], mx.inputs[1]); wt.links.new(dk.outputs[0], mx.inputs[2])
        wt.links.new(mx.outputs[0], wt.nodes['World Output'].inputs['Surface'])
        T = ring_center
        gl = _emit_mat('gemlight', HYB_STRIP); sp = _emit_mat('spark', HYB_SPARK)
        blk = bpy.data.materials.new('blackcard'); blk.use_nodes = True; bb_ = blk.node_tree.nodes['Principled BSDF']; bb_.inputs['Base Color'].default_value = (0.005, 0.005, 0.005, 1)
        def gem_only(o): o.visible_glossy = False; o.visible_diffuse = False; o.visible_camera = False; o.visible_shadow = False
        NS = int(_os.environ.get('HYB_NSTRIP', 12)); SW = float(_os.environ.get('HYB_SW', 5))
        seed = _os.environ.get('HYB_SEED')
        import random as _rnd; rg = _rnd.Random(int(seed) if seed else 0); J = 1.0 if seed else 0.0  # studio irrégulier (comme un vrai studio photo)
        for ring_i, (rr, zz) in enumerate(((80, 72), (95, 30))):
            for k in range(NS):
                aa = 2 * math.pi * (k + 0.5 + 0.5 * ring_i + J * rg.uniform(-0.35, 0.35)) / NS
                sw = SW * (1 + J * rg.uniform(-0.5, 0.6)); z_ = zz + J * rg.uniform(-18, 18); ln = 55 * (1 + J * rg.uniform(-0.4, 0.3))
                gem_only(_panel(f'hstrip_{ring_i}_{k}', (rr * math.cos(aa), rr * math.sin(aa), T[2] + z_), (sw, ln), gl, T))
        for side in (-1, 1): gem_only(_panel(f'hside_{side}', (side * 90, -25 + J * rg.uniform(-20, 20), T[2] + 50), (12, 110), gl, T))
        for k in range(36):
            aa = 2 * math.pi * k / 36; gem_only(_panel(f'hspark_{k}', (85 * math.cos(aa), 85 * math.sin(aa), T[2] + 50 + 35 * math.sin(3 * aa)), (2.2, 2.2), sp, T))
        cards = [(-60, -75, 95), (60, -75, 95), (0, 70, 115), (-100, 20, 55), (100, 20, 55), (-45, -110, 40), (45, -110, 40)]
        if seed: cards = [(rg.uniform(-110, 110), rg.uniform(-115, 90), rg.uniform(35, 120)) for _ in range(int(_os.environ.get('HYB_NCARD', 9)))]
        CS = float(_os.environ.get('HYB_CARD', 30))
        for k, (x, y, z) in enumerate(cards):
            gem_only(_panel(f'hcard_{k}', (x, y, T[2] + z), (CS * (1 + J * rg.uniform(-0.3, 0.5)),) * 2, blk, T))
        HYB_KEY = float(_os.environ.get('HYB_KEY', 3.0))
        if HYB_KEY > 0: KEY_PENDING.append(HYB_KEY)
    cam_d = bpy.data.cameras.new('cam'); cam_d.lens = 105; cam_d.clip_start = 1; cam_d.clip_end = 3000
    cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
    views = {'hero': (0, 66, 88), 'hero78': (0, 78, 88), 'face': (0, 30, 92), 'trois_quarts': (-35, 26, 96), 'cote': (90, 4, 92), 'dessus': (0, 88, 88), 'tete': (-30, 40, 38)}
    az, el, dd = views[view]; dd = dist if (dist and view != 'tete') else dd
    a, e = math.radians(az), math.radians(el); target = Vector(ring_center)
    cam.location = target + Vector((dd * math.cos(e) * math.sin(a), -dd * math.cos(e) * math.cos(a), dd * math.sin(e)))
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
    for e in KEY_PENDING:  # boîte derrière l'objectif, vue seulement à travers les pierres (éclat)
        kb = _panel('hkey', tuple(target + (cam.location - target) * 2.2), (60, 60), _emit_mat('hkey', e), tuple(target))
        kb.visible_glossy = False; kb.visible_diffuse = False; kb.visible_camera = False; kb.visible_shadow = False
        # le photographe et l'objectif vus dans la pierre : gris foncé, jamais un trou noir
        pm = bpy.data.materials.get('photocard') or _emit_mat('photocard', float(_os.environ.get('HYB_PHOTO_GREY', 0.25)))
        ps = float(_os.environ.get('HYB_PHOTO', 14)); ph = _panel('hphoto', tuple(target + (cam.location - target) * 1.12), (ps, ps), pm, tuple(target))
        ph.visible_glossy = False; ph.visible_diffuse = False; ph.visible_camera = False; ph.visible_shadow = False
    KEY_PENDING.clear()
    return cam

def composite_white(src, dst, bg=(250, 250, 250), contact=False):
    from PIL import Image, ImageFilter
    im = Image.open(src).convert('RGBA'); base = Image.new('RGBA', im.size, (*bg, 255))
    if contact:  # ombre de contact douce sous la bague (forme de la silhouette écrasée, floutée)
        a = im.split()[3]; bb = a.getbbox()
        if bb:
            w, h = im.size; sil = a.crop(bb).resize((bb[2] - bb[0], max(2, (bb[3] - bb[1]) // 9)))
            sh = Image.new('L', im.size, 0); sh.paste(sil, (bb[0], bb[3] - sil.size[1] // 2))
            sh = sh.filter(ImageFilter.GaussianBlur(w / 60)).point(lambda v: int(v * 0.35))
            base = Image.composite(Image.new('RGBA', im.size, (120, 120, 120, 255)), base, sh)
    Image.alpha_composite(base, im).convert('RGB').save(dst, quality=95)

if __name__ == '__main__':
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
    ap = argparse.ArgumentParser(); ap.add_argument('model'); ap.add_argument('out'); ap.add_argument('--metal', default='blanc')
    ap.add_argument('--view', default='face'); ap.add_argument('--res', type=int, default=1000); ap.add_argument('--samples', type=int, default=128)
    ap.add_argument('--turntable', type=int, default=0); ap.add_argument('--pave', action='store_true'); ap.add_argument('--fire', action='store_true'); ap.add_argument('--dist', type=float, default=None)
    a = ap.parse_args(argv)
    PAVE = a.pave
    reset(); build_ring(a.model, a.metal); studio(a.view, a.res, a.samples, dist=a.dist)
    raw = a.out.replace('.png', '_raw.png')
    if a.turntable:
        import os
        root = bpy.data.objects['ring']; base = root.matrix_world.copy()
        os.makedirs(a.out, exist_ok=True)
        for k in range(a.turntable):
            root.matrix_world = Matrix.Rotation(2 * math.pi * k / a.turntable, 4, 'Z') @ base
            f = os.path.join(a.out, f'{k:03d}_raw.png'); bpy.context.scene.render.filepath = f; bpy.ops.render.render(write_still=True)
            composite_white(f, os.path.join(a.out, f'{k:03d}.png')); os.remove(f); print('image', k, flush=True)
        sys.exit(0)
    if not a.fire:
        bpy.context.scene.render.filepath = raw; bpy.ops.render.render(write_still=True)
    else:
        from PIL import Image
        chans = []
        for k, ior in enumerate((2.407, 2.419, 2.451)):
            bpy.data.materials['diamond'].node_tree.nodes['glass'].inputs['IOR'].default_value = ior
            f = raw.replace('_raw', f'_ch{k}'); bpy.context.scene.render.filepath = f; bpy.ops.render.render(write_still=True)
            chans.append(Image.open(f).convert('RGBA').split())
        Image.merge('RGBA', (chans[0][0], chans[1][1], chans[2][2], chans[1][3])).save(raw)
    composite_white(raw, a.out)
    print('rendu', a.out)
