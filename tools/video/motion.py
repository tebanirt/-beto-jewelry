"""motion — renders a motion-design layer (motion_lib.js elements) to a transparent PNG sequence, cached.

spec["motion"] = dict(elements=[dict(type="stack", at=0, until=4, lines=[...]), ...])   # at/until in beats
pro.build() passes the beat grid of the music, so every move lands on a beat."""
import hashlib, json, os
import reelkit as rk

E = rk.E                                           # work dir (outputs)
HERE = os.path.dirname(os.path.abspath(__file__))  # code dir (motion.js, motion_lib.js)


def render(name, mspec, beat_times, total):
    lib = open(f"{HERE}/motion_lib.js").read() + open(f"{HERE}/motion.js").read()
    spec = dict(mspec)
    spec["beats"] = [round(float(x), 4) for x in beat_times]
    spec["total"] = round(float(total), 4)
    srcs = "".join(f"{e['src']}:{os.path.getmtime(e['src'])}" for e in spec.get("elements", []) if e.get("src"))
    key = hashlib.md5((json.dumps(spec, sort_keys=True, ensure_ascii=False) + lib + srcs).encode()).hexdigest()[:12]
    d = f"{E}/motion/{name}_{key}"
    if os.path.exists(f"{d}/done"):
        return d
    os.makedirs(d, exist_ok=True)
    json.dump(spec, open(f"{d}/spec.json", "w"), ensure_ascii=False)
    rk.run(["node", f"{HERE}/motion.js", rk.FONTS, f"{d}/spec.json", d, rk.LOGO, f"{HERE}/motion_lib.js"])
    # every frame must be RGBA (PNG colour type 6): an RGB frame makes ffmpeg rebuild the filter graph mid-video
    bad = [f for f in sorted(os.listdir(d)) if f.endswith(".png") and open(f"{d}/{f}", "rb").read(26)[25] != 6]
    if bad:
        raise SystemExit(f"motion {name}: {len(bad)} frames without alpha (first {bad[0]}): keep every layer below 100 % opacity")
    open(f"{d}/done", "w").write("ok")
    return d
