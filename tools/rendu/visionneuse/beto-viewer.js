// Visionneuse Beto Jewelry — diamants calculés (lancer de rayons dans la pierre) et métal en studio.
// Shader du diamant adapté de MeshRefractionMaterial (pmndrs/drei, licence MIT, auteur N8Programs),
// avec reflet de Fresnel réel et dispersion en trois couleurs.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MeshBVH, MeshBVHUniformStruct, SAH, shaderStructs, shaderIntersectFunction } from 'three-mesh-bvh';

// ---------- Environnements de studio peints (HDR, aucune image téléchargée) ----------
// Repère de la caméra : x à droite, y en haut, +z vers l'objectif. L'éclairage suit la caméra (studio photo).
function paintEquirect(w, h, fn) {
  const data = new Float32Array(w * h * 4);
  for (let y = 0; y < h; y++) {
    const el = ((y + 0.5) / h - 0.5) * Math.PI;          // ligne 0 = bas (v = 0), comme equirectUv
    for (let x = 0; x < w; x++) {
      const az = ((x + 0.5) / w) * 2 * Math.PI - Math.PI;
      const d = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
      const c = fn(d, az, el);
      const i = (y * w + x) * 4;
      data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 1;
    }
  }
  return finishEquirect(data, w, h);
}
function stampSparks(data, w, h, sparks, energy, radDeg = 1.1) {
  for (const [a, e] of sparks) {
    const c = dirOf(a, e);
    const el0 = Math.asin(c[1]), az0 = Math.atan2(c[2], c[0]);
    const r = THREE.MathUtils.degToRad(radDeg) * 1.6;
    const y0 = Math.max(0, Math.floor(((el0 - r) / Math.PI + 0.5) * h)), y1 = Math.min(h - 1, Math.ceil(((el0 + r) / Math.PI + 0.5) * h));
    for (let y = y0; y <= y1; y++) {
      const el = ((y + 0.5) / h - 0.5) * Math.PI, cw = Math.max(0.05, Math.cos(el)), ra = r / cw;
      const x0 = Math.floor(((az0 - ra + Math.PI) / (2 * Math.PI)) * w), x1 = Math.ceil(((az0 + ra + Math.PI) / (2 * Math.PI)) * w);
      for (let xx = x0; xx <= x1; xx++) {
        const x = ((xx % w) + w) % w, az = ((x + 0.5) / w) * 2 * Math.PI - Math.PI;
        const d = [Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)];
        const k = energy * (1 - ss(radDeg * 0.55, radDeg, THREE.MathUtils.radToDeg(angTo(d, c))));
        if (k > 0) { const i = (y * w + x) * 4; data[i] += k; data[i + 1] += k; data[i + 2] += k; }
      }
    }
  }
}
function finishEquirect(data, w, h) {
  const t = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.FloatType);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
  t.colorSpace = THREE.LinearSRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
const ss = (e0, e1, x) => THREE.MathUtils.smoothstep(x, e0, e1);
const angTo = (d, v) => Math.acos(Math.max(-1, Math.min(1, d[0] * v[0] + d[1] * v[1] + d[2] * v[2])));
const dirOf = (azDeg, elDeg) => { const a = THREE.MathUtils.degToRad(azDeg), e = THREE.MathUtils.degToRad(elDeg); return [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)]; }; // azimut 0 = objectif
const rect = (d, c, hw, hh, soft = 1.2) => { // boîte en degrés autour d'une direction c (azimut, élévation)
  const az = THREE.MathUtils.radToDeg(Math.atan2(d[0], d[2])), el = THREE.MathUtils.radToDeg(Math.asin(d[1]));
  let da = Math.abs(((az - c[0] + 540) % 360) - 180), de = Math.abs(el - c[1]);
  return (1 - ss(hw - soft, hw + soft, da)) * (1 - ss(hh - soft, hh + soft, de));
};
// tente de studio : panneaux lumineux séparés par des montants sombres
function tent(d, azStep, elStep, gapDeg, dark) {
  const az = THREE.MathUtils.radToDeg(Math.atan2(d[0], d[2])), el = THREE.MathUtils.radToDeg(Math.asin(d[1]));
  const fa = Math.abs(((az % azStep) + azStep) % azStep - azStep / 2), fe = Math.abs(((el % elStep) + elStep) % elStep - elStep / 2);
  const gA = ss(azStep / 2 - gapDeg, azStep / 2 - gapDeg * 0.4, fa), gE = ss(elStep / 2 - gapDeg, elStep / 2 - gapDeg * 0.4, fe);
  return 1 - dark * Math.max(gA, gE);
}
const SPARKS = Array.from({ length: 90 }, (_, k) => [(k * 137.508) % 360 - 180, -10 + ((k * 61.8) % 85)]);
function metalStudio(d) {
  const el = Math.asin(d[1]);
  let v = 0.62 + 0.38 * Math.max(0, Math.sin(el));
  if (el < 0) v = 0.30 + 0.32 * (1 + Math.sin(el));
  v *= 1 - 0.7 * Math.exp(-Math.pow((el + 0.02) / 0.05, 2));             // ligne d'horizon sombre
  v *= tent(d, 60, 40, 5, 0.45);
  let L = 0;
  L += 2.2 * rect(d, [0, 12], 30, 18, 8);                                 // boîte derrière l'objectif
  L += 7.0 * rect(d, [-70, 20], 5, 35); L += 7.0 * rect(d, [70, 20], 5, 35); // bandes latérales
  L += 4.0 * rect(d, [-140, 25], 6, 30); L += 4.0 * rect(d, [140, 25], 6, 30);
  L += 2.0 * rect(d, [0, 70], 60, 15, 6);                                  // plafond
  return v + L;
}
function gemStudio(d) {
  const deg = THREE.MathUtils.radToDeg(angTo(d, [0, 0, 1]));
  const el = THREE.MathUtils.radToDeg(Math.asin(d[1]));
  // murs blancs du studio devant la bague, fond sombre derrière
  let v = GEM.wall * (1 - ss(GEM.wallDeg - 15, GEM.wallDeg + 15, deg)) + GEM.back;
  v *= tent(d, 18, 16, 3, 0.92);
  v *= 1 - 0.9 * (1 - ss(3.5, 5.5, deg));                                          // objectif (sombre)
  v *= 1 - 0.85 * rect(d, [0, -16], 9, 10, 4);                                     // photographe sous l'objectif
  v += GEM.ring * (ss(5.5, 7, deg) * (1 - ss(12, 14, deg)));                       // anneau lumineux
  let L = 0;
  for (let k = 0; k < 12; k++) L += GEM.strip * rect(d, [-180 + (k + 0.5) * 30, 45], 2.2, 22, 0.8);
  L += GEM.side * rect(d, [-38, 15], 4, 28, 1); L += GEM.side * rect(d, [38, 15], 4, 28, 1);
  // cartes noires entre les sources (motif des facettes)
  for (const [a, e] of [[-22, 30], [22, 30], [-55, -5], [55, -5], [0, 40]]) v *= 1 - 0.9 * rect(d, [a, e], 7, 7, 2);
  return v + L;
}
export const GEM = { wall: 1.6, wallDeg: 60, back: 0.04, ring: 6, strip: 6, side: 7, spark: 40 };

// ---------- Matériau diamant ----------
function diamondMaterial(geometry, envMap, opts = {}) {
  const bvh = new MeshBVHUniformStruct();
  bvh.updateFrom(new MeshBVH(geometry.clone().toNonIndexed(), { strategy: SAH }));
  return new THREE.ShaderMaterial({
    defines: { CHROMATIC_ABERRATIONS: '' },
    uniforms: {
      envMap: { value: envMap }, bvh: { value: bvh },
      bounces: { value: opts.bounces ?? 6 }, ior: { value: opts.ior ?? 2.417 },
      aberrationStrength: { value: opts.aberration ?? 0.0075 },
      color: { value: new THREE.Color(opts.color ?? 0xffffff) },
      absorb: { value: opts.absorb ?? 0 },
      viewMatrixInverse: { value: new THREE.Matrix4() },
      projectionMatrixInverse: { value: new THREE.Matrix4() },
      envGain: { value: opts.gain ?? 1.0 }, camRot: { value: new THREE.Matrix3() },
    },
    vertexShader: /* glsl */`
      varying vec3 vWorldPosition; varying vec3 vNormal; varying mat4 vModelMatrixInverse;
      uniform mat4 viewMatrixInverse;
      void main() {
        vec4 tn = vec4(normal, 0.0); vec4 tp = vec4(position, 1.0);
        mat4 M = modelMatrix;
        #ifdef USE_INSTANCING
          M = modelMatrix * instanceMatrix;
        #endif
        vModelMatrixInverse = inverse(M);
        vWorldPosition = (M * tp).xyz;
        vNormal = normalize((M * tn).xyz);
        gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0);
      }`,
    fragmentShader: /* glsl */`
      precision highp isampler2D; precision highp usampler2D;
      varying vec3 vWorldPosition; varying vec3 vNormal; varying mat4 vModelMatrixInverse;
      uniform sampler2D envMap; uniform float bounces; uniform float ior; uniform float aberrationStrength;
      uniform vec3 color; uniform float absorb; uniform float envGain; uniform mat3 camRot;
      ${shaderStructs}
      ${shaderIntersectFunction}
      uniform BVH bvh;
      vec2 equi(vec3 d) { d = normalize(d); return vec2(atan(d.z, d.x) * 0.15915494 + 0.5, asin(clamp(d.y, -1.0, 1.0)) * 0.31830988 + 0.5); }
      vec3 env(vec3 d) { return texture2D(envMap, equi(camRot * d)).rgb * envGain; }
      // Suit le rayon dans la pierre (réflexion totale interne), renvoie la direction de sortie et la distance parcourue
      vec3 trace(vec3 rd, vec3 n, float eta, mat4 inv, mat4 M, out float travel) {
        travel = 0.0;
        vec3 dir = refract(rd, n, 1.0 / eta);
        vec3 ro = (inv * vec4(vWorldPosition + dir * 0.0005, 1.0)).xyz;
        dir = normalize((inv * vec4(dir, 0.0)).xyz);
        for (float i = 0.0; i < 12.0; i++) {
          if (i >= bounces) break;
          uvec4 fi = uvec4(0u); vec3 fn = vec3(0.0, 0.0, 1.0); vec3 bc = vec3(0.0); float side = 1.0; float dist = 0.0;
          bvhIntersectFirstHit(bvh, ro, dir, fi, fn, bc, side, dist);
          travel += dist;
          vec3 hit = ro + dir * max(dist - 0.0005, 0.0);
          vec3 outDir = refract(dir, fn, eta);
          if (length(outDir) > 0.0) { dir = outDir; break; }
          dir = reflect(dir, fn);
          ro = hit + dir * 0.002;
        }
        return normalize((M * vec4(dir, 0.0)).xyz);
      }
      void main() {
        mat4 inv = vModelMatrixInverse; mat4 M = inverse(inv);
        vec3 rd = normalize(vWorldPosition - cameraPosition);
        vec3 n = normalize(vNormal);
        if (dot(n, rd) > 0.0) n = -n;
        float t;
        vec3 dG = trace(rd, n, ior, inv, M, t);
        vec3 dR = trace(rd, n, ior * (1.0 - aberrationStrength), inv, M, t);
        vec3 dB = trace(rd, n, ior * (1.0 + aberrationStrength), inv, M, t);
        vec3 refr = vec3(env(dR).r, env(dG).g, env(dB).b);
        // couleur de la pierre (diamants de couleur) : absorption selon le chemin parcouru dans la pierre
        vec3 tint = mix(vec3(1.0), color, clamp(1.0 - exp(-absorb * t), 0.0, 1.0));
        refr *= tint;
        // reflet de surface (Fresnel, diamant F0 = 0,172)
        float cosT = clamp(dot(-rd, n), 0.0, 1.0);
        float F = 0.172 + (1.0 - 0.172) * pow(1.0 - cosT, 5.0);
        vec3 refl = env(reflect(rd, n));
        vec3 c = mix(refr, refl, F);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

// ---------- Géométrie ----------
function decodeModel(m) {
  const raw = atob(m.bin), buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  const B = buf.buffer;
  const parts = m.parts.map((p) => {
    let P;
    if (p.q) {
      const q = new Int16Array(B, p.p, p.nv * 3); P = new Float32Array(p.nv * 3);
      for (let j = 0; j < P.length; j++) { const a = j % 3; P[j] = p.q[2 * a] + (q[j] + 32768) / 65535 * (p.q[2 * a + 1] - p.q[2 * a]); }
    } else P = new Float32Array(B.slice(p.p, p.p + p.nv * 12));
    const N8 = new Int8Array(B, p.n, p.nv * 3), N = new Float32Array(p.nv * 3);
    for (let j = 0; j < N.length; j += 3) { const l = Math.hypot(N8[j], N8[j + 1], N8[j + 2]) || 1; N[j] = N8[j] / l; N[j + 1] = N8[j + 1] / l; N[j + 2] = N8[j + 2] / l; }
    const I = p.i16 ? new Uint16Array(B.slice(p.i, p.i + p.nt * 6)) : new Uint32Array(B.slice(p.i, p.i + p.nt * 12));
    return { meta: p, P, N, I };
  });
  return { parts, gems: m.gems, defs: m.defs };
}
function gemGeometry(g) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(g.v, 3));
  geo.setIndex(g.f);
  const flat = geo.toNonIndexed(); flat.computeVertexNormals();
  return flat;
}
function catmull(P, per = 6) {
  const n = P.length, out = [];
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let s = 0; s < per; s++) {
      const t = s / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  return out;
}
function bandGeometry(profile, segs = 360) {
  const prof = catmull(profile, 6), m = prof.length, pos = [], idx = [];
  for (let i = 0; i < segs; i++) { const a = (i / segs) * Math.PI * 2; for (const [r, z] of prof) pos.push(r * Math.cos(a), r * Math.sin(a), z); }
  for (let i = 0; i < segs; i++) { const i2 = (i + 1) % segs; for (let j = 0; j < m; j++) { const j2 = (j + 1) % m; idx.push(i * m + j, i2 * m + j, i2 * m + j2, i * m + j, i2 * m + j2, i * m + j2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export const METALS = { blanc: 0xdcdad6, jaune: 0xf0c46e, rose: 0xeab09a, platine: 0xcfcdc9 };

export async function createViewer(canvas, opts = {}) {
  const base = opts.base || './';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !!opts.transparent, preserveDrawingBuffer: !!opts.preserve });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = opts.exposure ?? 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = opts.transparent ? null : new THREE.Color(0xfafafa);
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 2000);
  const controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = 40; controls.maxDistance = 160;

  const metalEnvTex = paintEquirect(1024, 512, (d) => { const v = metalStudio(d); return [v, v, v * 0.995]; });
  const pmrem = new THREE.PMREMGenerator(renderer); const metalEnv = pmrem.fromEquirectangular(metalEnvTex).texture;
  const gemEnv = paintEquirect(2048, 1024, (d) => { const v = gemStudio(d); return [v, v, v]; });
  stampSparks(gemEnv.image.data, 2048, 1024, SPARKS, GEM.spark); gemEnv.needsUpdate = true;

  const [model, gems, prof, profPave] = await Promise.all([
    fetch(base + 'models/sol4.json').then((r) => r.json()),
    fetch(base + 'gems.json').then((r) => r.json()),
    fetch(base + 'profile_sol4.json').then((r) => r.json()),
    fetch(base + 'profile_sol4_pave.json').then((r) => r.json()),
  ]);
  const D = decodeModel(model);
  const metal = new THREE.MeshPhysicalMaterial({ color: METALS[opts.metal || 'blanc'], metalness: 1, roughness: 0.06, envMap: metalEnv, envMapIntensity: 1.0 });
  const ring = new THREE.Group(); ring.rotation.x = -Math.PI / 2; // modèle y-haut → scène
  const upright = new THREE.Group(); upright.add(ring); scene.add(upright);
  ring.rotation.set(0, 0, 0);
  const gemMats = [];
  let current = {};

  // ombre de contact douce
  const sh = document.createElement('canvas'); sh.width = sh.height = 256; const sx = sh.getContext('2d');
  const grd = sx.createRadialGradient(128, 128, 10, 128, 128, 128); grd.addColorStop(0, 'rgba(0,0,0,0.22)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  sx.fillStyle = grd; sx.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(24, 5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -10.3; scene.add(shadow);

  function buildSolo() {
    // une pierre seule, posée table vers la caméra (vignettes du sélecteur)
    const geo = gemGeometry(gems[current.shape] || gems.rond);
    geo.scale(4.6, 4.6, 4.6); geo.rotateX(-Math.PI / 2); // table vers +y
    const c = current.stone || {};
    const mat = diamondMaterial(geo, gemEnv, { ior: c.ior ?? 2.417, color: c.color ?? 0xffffff, absorb: c.absorb ?? 0, aberration: c.aberration ?? 0.0075, gain: (opts.gemGain ?? 1) * (c.gain ?? 1.3) });
    gemMats.push(mat); ring.add(new THREE.Mesh(geo, mat)); shadow.visible = false; requestRender();
  }
  function build(cfg) {
    current = Object.assign({ metal: 'blanc', shape: 'ovale', pave: false, headScale: 0.85, labColor: null }, cfg);
    ring.clear(); gemMats.length = 0;
    if (current.solo) return buildSolo();
    metal.color.set(METALS[current.metal]);
    const hs = current.headScale;
    for (const p of D.parts) {
      if (p.meta.role === 'prong' && p.meta.variant) continue;
      let geo;
      if (p.meta.role === 'band') geo = bandGeometry(current.pave ? profPave : prof);
      else {
        geo = new THREE.BufferGeometry();
        const P = p.P.slice();
        for (let j = 0; j < P.length; j += 3) { P[j] *= hs; P[j + 1] = 10.05 + (P[j + 1] - 10.05) * hs; P[j + 2] *= hs; }
        geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(p.N, 3)); geo.setIndex(new THREE.BufferAttribute(p.I, 1));
      }
      ring.add(new THREE.Mesh(geo, metal));
    }
    // pierre centrale : vraie taille, posée selon la matrice du modèle de Rayane
    const g = D.gems.find((x) => x.def === 'Oval') || D.gems[0];
    const bb = D.defs[g.def].bb;
    const gg = gems[current.shape] || gems.ovale;
    const geo = gemGeometry(gg);
    geo.computeBoundingBox(); const b = geo.boundingBox;
    const sxy = Math.min(bb[3] / ((b.max.x - b.min.x) / 2 || 1), bb[4] / ((b.max.y - b.min.y) / 2 || 1));
    const zTop = b.max.z, zBot = -b.min.z;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setX(i, pos.getX(i) * sxy); pos.setY(i, pos.getY(i) * sxy);
      const z = pos.getZ(i); pos.setZ(i, z > 0 ? z * bb[5] / zTop : z * -bb[2] / zBot);
    }
    geo.computeVertexNormals();
    const lab = current.labColor;
    const mat = diamondMaterial(geo, gemEnv, Object.assign({ gain: (opts.gemGain ?? 1) * 1.3 }, lab ? { color: lab.color, absorb: lab.absorb } : {}));
    gemMats.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    const m = g.m; const M = new THREE.Matrix4().set(m[0][0], m[0][1], m[0][2], m[0][3], m[1][0], m[1][1], m[1][2], m[1][3], m[2][0], m[2][1], m[2][2], m[2][3], 0, 0, 0, 1);
    const S = new THREE.Matrix4().set(hs, 0, 0, 0, 0, hs, 0, 10.05 * (1 - hs), 0, 0, hs, 0, 0, 0, 0, 1);
    mesh.matrixAutoUpdate = false; mesh.matrix.copy(S.multiply(M));
    ring.add(mesh);
    if (current.pave) addPave();
    requestRender();
  }

  function addPave(start = 76.5, end = -6, d = (window.PAVE_D || 1.4), gap = 0.06, R = 10.05, sink = 0.05) {
    const r = d / 2, pitch = THREE.MathUtils.radToDeg((d + gap) / R);
    const angles = []; for (let a = start; a >= end - 1e-6; a -= pitch) angles.push(a);
    const geo = gemGeometry(gems.rond); // rayon 1 → mis à l'échelle par instance
    const mat = diamondMaterial(geo, gemEnv, { bounces: 5, gain: (opts.gemGain ?? 1) * 1.6 }); gemMats.push(mat);
    const inst = new THREE.InstancedMesh(geo, mat, angles.length * 2);
    const beadGeo = new THREE.SphereGeometry(0.19, 20, 12);
    const beads = new THREE.InstancedMesh(beadGeo, metal, (angles.length + 1) * 4);
    let k = 0, kb = 0; const M = new THREE.Matrix4();
    for (const side of [1, -1]) {
      for (const a of angles) {
        const th = THREE.MathUtils.degToRad(90 + side * (90 - a));
        const u = new THREE.Vector3(Math.cos(th), Math.sin(th), 0), t = new THREE.Vector3(-Math.sin(th), Math.cos(th), 0), w = new THREE.Vector3(0, 0, 1);
        M.makeBasis(w.clone().multiplyScalar(r), t.clone().multiplyScalar(-r), u.clone().multiplyScalar(r)).setPosition(u.clone().multiplyScalar(R - sink));
        inst.setMatrixAt(k++, M);
      }
      const ba = [angles[0] + pitch / 2, ...angles.map((x) => x - pitch / 2)];
      for (const a of ba) {
        const th = THREE.MathUtils.degToRad(90 + side * (90 - a));
        for (const zz of [-r * 0.8, r * 0.8]) {
          const rr = R - 0.03 - 0.06 * Math.pow(Math.abs(zz) / 0.8, 2);
          beads.setMatrixAt(kb++, new THREE.Matrix4().makeTranslation(Math.cos(th) * rr, Math.sin(th) * rr, zz));
        }
      }
    }
    inst.count = k; beads.count = kb; ring.add(inst); ring.add(beads);
  }

  const views = { solo: [0, 78, 34, [0, 0, 0]], epaule: [-25, 60, 32, [-6.5, 7.5, 0]], principale: [0, 66, 88], face: [0, 30, 92], cote: [90, 4, 92], trois_quarts: [-35, 26, 96], dessus: [0, 88, 88] };
  const target = new THREE.Vector3(0, 3.5, 0);
  function setView(name) {
    const [az, el, d, tg] = views[name] || views.principale; const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
    target.set(...(tg || [0, 3.5, 0])); controls.minDistance = Math.min(40, d);
    // repère de la scène : y vers le haut, la bague debout dans le plan xy, l'axe du doigt suivant z
    camera.position.set(target.x + d * Math.cos(e) * Math.sin(a), target.y + d * Math.sin(e), target.z + d * Math.cos(e) * Math.cos(a));
    controls.target.copy(target); camera.lookAt(target); controls.update(); requestRender();
  }
  let pending = false;
  function requestRender() { if (!pending) { pending = true; requestAnimationFrame(frame); } }
  function frame() {
    pending = false;
    const c = renderer.domElement, w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.floor(w * renderer.getPixelRatio()) || c.height !== Math.floor(h * renderer.getPixelRatio())) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const moving = controls.update();
    camera.updateMatrixWorld();
    const vr = new THREE.Matrix3().setFromMatrix4(camera.matrixWorldInverse);
    for (const m of gemMats) { m.uniforms.camRot.value.copy(vr); }
    metal.envMapRotation.setFromRotationMatrix(new THREE.Matrix4().setFromMatrix3(vr));
    renderer.render(scene, camera);
    if (moving) requestRender();
  }
  controls.addEventListener('change', requestRender);
  window.addEventListener('resize', requestRender);
  build(opts.config || {}); setView(opts.view || 'principale');
  return { build, setView, render: requestRender, renderer, scene, camera, get config() { return current; } };
}
