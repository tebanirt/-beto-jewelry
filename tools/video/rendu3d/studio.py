"""studio — photoreal ring renders in Blender (Cycles), Brilliant Earth style: white seamless background, soft studio
strips for contrast in the metal and the diamond, a real 57-facet round brilliant with dispersion.

Runs with Blender as a Python module (pip package `bpy`, Blender Foundation, GPL):
    $BVENV/bin/python studio.py OUT.png [--style solitaire|cathedrale] [--metal jaune|blanc|rose] [--samples 128]
           [--view trois-quarts|profil|dessus] [--size 1080] [--stl FILE.stl]

Units: 1 Blender unit = 1 mm. A render is a 3D image, never a photo: label it « rendu 3D » wherever it is used.
"""
import argparse
import math
import os
import sys

import bpy  # first: bmesh and mathutils exist only once bpy is loaded
import bmesh
from mathutils import Vector

ap = argparse.ArgumentParser()
ap.add_argument("out")
ap.add_argument("--style", default="solitaire")
ap.add_argument("--metal", default="jaune")
ap.add_argument("--samples", type=int, default=128)
ap.add_argument("--view", default="trois-quarts")
ap.add_argument("--size", type=int, default=1080)
ap.add_argument("--carat-mm", type=float, default=8.2)      # 2 ct round
ap.add_argument("--stl", default=None)
ap.add_argument("--frames", type=int, default=0)             # >0: turntable, OUT is a folder
args = ap.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:])

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

METALS = {  # linear reflectance of 14k alloys (paler than pure gold)
    "jaune": (1.0, 0.77, 0.40), "blanc": (0.86, 0.86, 0.84), "rose": (0.95, 0.55, 0.42), "platine": (0.80, 0.79, 0.77),
}


# ------------------------------------------------------------------ materials
def mat_metal(kind):
    m = bpy.data.materials.new(f"or_{kind}")
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*METALS[kind], 1)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = 0.11
    return m


def mat_diamond():
    m = bpy.data.materials.new("diamant")
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (1, 1, 1, 1)
    p.inputs["Metallic"].default_value = 0.0
    p.inputs["Roughness"].default_value = 0.0
    p.inputs["IOR"].default_value = 2.417
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["Transmission Dispersion Scale"].default_value = 1.0
    p.inputs["Transmission Dispersion Abbe Number"].default_value = 55.0
    return m


# ------------------------------------------------------------------ round brilliant (57 facets + girdle)
def round_brilliant(name, D, mat, girdle_frac=0.025, table=0.56, crown_deg=34.5, pav_deg=40.75, star=0.5, lower=0.77):
    """Real round-brilliant geometry: table, 8 stars, 8 bezels, 16 upper girdle, 8 pavilion mains, 16 lower girdle.
    Centre of the top of the girdle at the origin, table up (+Z)."""
    R = D / 2
    tc, tp = math.tan(math.radians(crown_deg)), math.tan(math.radians(pav_deg))
    g = D * girdle_frac
    rt = R * table / math.cos(math.pi / 8)                       # table octagon vertex radius (flats at table %)
    zt = (R - rt * math.cos(0)) * tc                              # table height (vertices lie on the bezel planes)
    u = lambda a: Vector((math.cos(a), math.sin(a), 0))
    bm = bmesh.new()
    T = [bm.verts.new(u(i * math.pi / 4) * rt + Vector((0, 0, (R - rt) * tc))) for i in range(8)]
    # star tips between table vertices, on the bezel planes
    rs = rt * math.cos(math.pi / 8) + star * (R - rt * math.cos(math.pi / 8))
    S = []
    for i in range(8):
        a = i * math.pi / 4 + math.pi / 8
        z = (R - rs * math.cos(math.pi / 8)) * tc
        S.append(bm.verts.new(u(a) * rs + Vector((0, 0, z))))
    GU = [bm.verts.new(u(j * math.pi / 8) * R) for j in range(16)]                 # top of the girdle
    GL = [bm.verts.new(u(j * math.pi / 8) * R + Vector((0, 0, -g))) for j in range(16)]
    zc = -g - R * tp
    Cu = bm.verts.new((0, 0, zc))
    rl = R * (1 - lower)
    L = []
    for i in range(8):
        a = i * math.pi / 4 + math.pi / 8
        z = -g - (R - rl * math.cos(math.pi / 8)) * tp
        L.append(bm.verts.new(u(a) * rl + Vector((0, 0, z))))
    f = bm.faces.new
    f(T)                                                           # table
    for i in range(8):
        n = (i + 1) % 8
        f([T[i], S[i], T[n]][::-1])                                # star
        f([T[i], S[(i - 1) % 8], GU[2 * i], S[i]][::-1])           # bezel (kite)
        f([S[i], GU[2 * i], GU[2 * i + 1]][::-1])                  # upper girdle halves
        f([S[i], GU[2 * i + 1], GU[(2 * i + 2) % 16]][::-1])
        f([Cu, L[(i - 1) % 8], GL[2 * i], L[i]])                   # pavilion main (kite)
        f([L[i], GL[2 * i], GL[2 * i + 1]])                        # lower girdle halves
        f([L[i], GL[2 * i + 1], GL[(2 * i + 2) % 16]])
    for j in range(16):
        n = (j + 1) % 16
        f([GU[j], GL[j], GL[n], GU[n]])                            # girdle
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(mat)
    for poly in me.polygons:
        poly.use_smooth = False
    bpy.context.collection.objects.link(ob)
    return ob, dict(zt=(R - rt) * tc, zc=zc, R=R, g=g)


# ------------------------------------------------------------------ ring parts
def spin_profile(name, prof, mat, seg=192):
    """prof: list of (r, y) around the band cross-section; spun around the Y axis (band circle in the XZ plane)."""
    bm = bmesh.new()
    rings = []
    for k in range(seg):
        a = 2 * math.pi * k / seg
        rings.append([bm.verts.new((r * math.sin(a), y, r * math.cos(a))) for r, y in prof])
    n = len(prof)
    for k in range(seg):
        A, B = rings[k], rings[(k + 1) % seg]
        for i in range(n):
            j = (i + 1) % n
            bm.faces.new([A[i], A[j], B[j], B[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    return ob


def band_profile(Ri, t, w, n=40):
    """Comfort-fit band: rounded outside, slightly domed inside."""
    pts = []
    for k in range(n):                       # outer half: superellipse from y=-w/2 to y=+w/2
        a = math.pi * k / (n - 1)
        y = -w / 2 * math.cos(a)
        s = math.sin(a)
        r = Ri + t * 0.42 + t * 0.58 * (abs(s) ** 0.55)
        pts.append((r, y))
    for k in range(n):                       # inner, back from +w/2 to -w/2, gentle dome
        a = math.pi * k / (n - 1)
        y = w / 2 * math.cos(a)
        r = Ri + t * 0.35 * (1 - math.sin(a) ** 0.6) - 0.08 * math.sin(a)
        pts.append((r, y))
    return pts


def tube(name, pts, radius, mat, taper=None):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 6
    cu.use_fill_caps = True
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    sp.use_endpoint_u = True
    sp.order_u = min(4, len(pts))
    sp.resolution_u = 24
    if taper:
        for p, w in zip(sp.points, taper):
            p.radius = w
    ob = bpy.data.objects.new(name, cu)
    ob.data.materials.append(mat)
    bpy.context.collection.objects.link(ob)
    return ob


def ring(style, metal, D):
    gold, dia = mat_metal(metal), mat_diamond()
    Ri, t, w = 8.5, 1.6, 2.0                                     # size 6.5, 2.0 x 1.6 mm shank
    spin_profile("anneau", band_profile(Ri, t, w), gold)
    top = Ri + t
    pav = D / 2 * math.tan(math.radians(40.75)) + D * 0.025
    zg = top + 0.7 + pav                                         # culet 0.7 mm above the shank
    stone, geo = round_brilliant("pierre", D, dia)
    stone.location = (0, 0, zg)
    R = D / 2
    # 4 claws: from the shank, hugging the pavilion, past the girdle, curling over the crown
    for k in range(4):
        a = math.pi / 4 + k * math.pi / 2
        c, s = math.cos(a), math.sin(a)
        P = lambda r, z: (r * c, r * s, z)
        pts = [P(1.25, top - 0.4), P(1.6, top + 0.6), P(R * 0.62, zg - pav * 0.45), P(R + 0.32, zg - 0.15),
               P(R + 0.28, zg + 0.55), P(R - 0.18, zg + geo["zt"] * 0.55)]
        tube(f"griffe{k}", pts, 0.44, gold, taper=[1.15, 1.05, 1.0, 0.95, 0.92, 0.82])
    # gallery rail under the girdle
    zr = zg - pav * 0.42
    rr = R * (1 - 0.42) + 0.42
    bpy.ops.mesh.primitive_torus_add(major_radius=rr, minor_radius=0.36, major_segments=96, minor_segments=16,
                                     location=(0, 0, zr))
    rail = bpy.context.active_object
    rail.data.materials.append(gold)
    for p in rail.data.polygons:
        p.use_smooth = True
    if style == "cathedrale":
        for sgn in (-1, 1):                                       # arches rising from the shoulders into the head
            for side in (-1, 1):
                y = side * 0.62
                a0 = math.radians(38)
                pts = [(sgn * (top - 0.6) * math.sin(a0), y, (top - 0.6) * math.cos(a0)),
                       (sgn * 5.4, y * 0.9, top + 0.9), (sgn * (rr + 0.6), y * 0.75, zr - 0.2),
                       (sgn * (rr + 0.1), y * 0.6, zr + 0.25)]
                tube(f"arche{sgn}{side}", pts, 0.5, gold, taper=[1.3, 1.0, 0.85, 0.75])
    return dict(top=top, zg=zg, ztable=zg + geo["zt"])


# ------------------------------------------------------------------ studio
CAM_DIR = (0.0, 0.0, 1.0)


def world_studio():
    """Camera rays: pure white (seamless background). Reflections: dark studio with softbox strips (contrast)."""
    w = bpy.data.worlds.new("studio")
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    N = nt.nodes
    for n in list(N):
        N.remove(n)
    out = N.new("ShaderNodeOutputWorld")
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])

    def math_(op, a, b=None, v=None):
        m = N.new("ShaderNodeMath")
        m.operation = op
        for i, x in enumerate((a, b)):
            if x is None:
                continue
            if isinstance(x, (int, float)):
                m.inputs[i].default_value = x
            else:
                nt.links.new(x, m.inputs[i])
        return m.outputs[0]

    def smooth(e0, e1, x):
        m = N.new("ShaderNodeMapRange")
        m.interpolation_type = "SMOOTHSTEP"
        m.inputs["From Min"].default_value = e0
        m.inputs["From Max"].default_value = e1
        nt.links.new(x, m.inputs["Value"])
        return m.outputs[0]

    x, y, z = sep.outputs[0], sep.outputs[1], sep.outputs[2]
    az = math_("ARCTAN2", y, x)
    top = math_("MULTIPLY", smooth(0.72, 0.9, z), 4.0)                           # softbox above (small: contrast)
    def strip(center, half, gain, zlo=-0.15, zhi=0.75):
        d = math_("ABSOLUTE", math_("SUBTRACT", az, center))
        s = math_("SUBTRACT", 1.0, smooth(half * 0.6, half, d))
        band = math_("MULTIPLY", smooth(zlo - 0.1, zlo, z), math_("SUBTRACT", 1.0, smooth(zhi, zhi + 0.1, z)))
        return math_("MULTIPLY", math_("MULTIPLY", s, band), gain)
    lights = math_("ADD", top, strip(2.3, 0.22, 7.0))
    lights = math_("ADD", lights, strip(-2.5, 0.16, 6.0))
    lights = math_("ADD", lights, strip(0.55, 0.12, 4.0, zlo=-0.05, zhi=0.5))
    lights = math_("ADD", lights, strip(-0.9, 0.08, 3.0, zlo=0.0, zhi=0.6))
    floor = math_("MULTIPLY", smooth(-0.1, -0.6, z), 0.35)                       # pale floor bounce
    env = math_("ADD", math_("ADD", lights, floor), 0.004)
    # black card around the lens: what a diamond shows face-up is the camera's surroundings, so the zone around the
    # view direction must be dark (that is what draws the black-and-white facet pattern of a good cut)
    vec = N.new("ShaderNodeVectorMath")
    vec.operation = "DOT_PRODUCT"
    nt.links.new(tc.outputs["Generated"], vec.inputs[0])
    vec.inputs[1].default_value = CAM_DIR
    card = math_("SUBTRACT", 1.0, smooth(0.80, 0.93, vec.outputs["Value"]))
    env = math_("MULTIPLY", env, card)
    bg_env = N.new("ShaderNodeBackground")
    nt.links.new(env, bg_env.inputs["Strength"])
    bg_cam = N.new("ShaderNodeBackground")
    bg_cam.inputs["Strength"].default_value = 1.0
    lp = N.new("ShaderNodeLightPath")
    mix = N.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs[0])
    nt.links.new(bg_env.outputs[0], mix.inputs[1])
    nt.links.new(bg_cam.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs[0])


def lights():
    def area(name, loc, size, power, look=(0, 0, 4)):
        L = bpy.data.lights.new(name, "AREA")
        L.size = size
        L.energy = power
        ob = bpy.data.objects.new(name, L)
        ob.location = loc
        d = Vector(look) - Vector(loc)
        ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        bpy.context.collection.objects.link(ob)
        ob.visible_camera = False
    area("cle", (-90, -70, 140), 80, 9000)
    area("contre", (110, 80, 90), 60, 6000)
    area("bas", (0, -120, -20), 90, 1500)


def shadow_catcher(z):
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, z))
    pl = bpy.context.active_object
    pl.is_shadow_catcher = True


def camera(view, target, dist=105, lens=100):
    cam = bpy.data.cameras.new("cam")
    cam.lens = lens
    ob = bpy.data.objects.new("cam", cam)
    bpy.context.collection.objects.link(ob)
    dirs = {"trois-quarts": (-0.52, -0.78, 0.36), "profil": (0.0, -1.0, 0.12), "dessus": (-0.05, -0.32, 0.95),
            "face": (-1.0, 0.0, 0.18)}
    d = Vector(dirs[view]).normalized()
    global CAM_DIR
    CAM_DIR = tuple(d)
    ob.location = Vector(target) + d * dist
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = ob
    return ob


def setup_render(size, samples):
    r = scene.render
    r.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 32
    scene.cycles.transmission_bounces = 24
    scene.cycles.glossy_bounces = 16
    scene.cycles.transparent_max_bounces = 16
    scene.cycles.caustics_reflective = False
    scene.cycles.caustics_refractive = False
    scene.cycles.blur_glossy = 0.0
    r.resolution_x = r.resolution_y = size
    r.film_transparent = True
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGBA"
    scene.view_settings.view_transform = os.environ.get("R3D_VIEW", "Standard")
    if scene.view_settings.view_transform == "AgX":
        scene.view_settings.look = "AgX - Punchy"
    scene.view_settings.exposure = float(os.environ.get("R3D_EXPOSURE", "-0.3"))


if __name__ == "__main__":
    D = args.carat_mm
    info = ring(args.style, args.metal, D)
    tgt = (0, 0, (info["ztable"] - (8.5 + 1.6)) / 2 - 1.0) if args.view != "dessus" else (0, 0, info["zg"])
    camera(args.view, tgt, dist=105 if args.view != "dessus" else 70)
    world_studio()
    lights()
    shadow_catcher(-(8.5 + 1.6))
    setup_render(args.size, args.samples)
    scene.render.filepath = args.out
    bpy.ops.render.render(write_still=True)
    print("rendered", args.out)
