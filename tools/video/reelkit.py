"""reelkit — Beto Jewelry reel engine (ffmpeg + Playwright text layers + synthesized audio).

A reel = list of shots (each rendered, graded, with effects) + text layers + audio events.
"""
import hashlib, json, os, subprocess, sys

import glob

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
# Working dirs (override with env vars). Nothing heavy is written inside the repo.
WORK = os.environ.get("BETO_WORK_DIR", "/tmp/beto-video")
E = WORK
FOOTAGE = os.environ.get("BETO_FOOTAGE_DIR", f"{WORK}/footage")      # iPhone clips, renders, CAD videos (any name)
BROLL = os.environ.get("BETO_BROLL_DIR", f"{WORK}/broll")            # videographer b-roll (FrameXXXXXXXX.mov)
FONTS = os.environ.get("BETO_FONTS_DIR", f"{WORK}/fonts_pkg")         # npm pack @fontsource/bodoni-moda @fontsource/jost
PY = os.environ.get("BETO_PY", "python3")                            # python with numpy + scipy (for sfx.py)
LOGO = f"{REPO}/tools/invoicing/assets/logo.png"                      # official logo, never modified
U = FOOTAGE
for d in (WORK, f"{WORK}/audio", f"{WORK}/layers", f"{WORK}/trials"):
    os.makedirs(d, exist_ok=True)


def _find(name):
    hits = sorted(glob.glob(f"{FOOTAGE}/*{name}"))
    if not hits:
        raise SystemExit(f"footage not found: {name} in {FOOTAGE}")
    return hits[0]


# Named iPhone clips of 9 Nov 2026 (all lab-grown diamonds, confirmed by Rayane)
CLIP_FILES = {"jaune": "IMG_5764.mov", "bleu": "IMG_5765.mov", "vert": "IMG_5766.mov", "rose": "IMG_5762.mov"}


class _Clips(dict):
    def __missing__(self, k):
        v = _find(CLIP_FILES[k]); self[k] = v; return v

    def __contains__(self, k):
        return k in CLIP_FILES


CLIP = _Clips()
_INFO = {}


def _upload(suffix):
    import glob as _g
    hits = sorted(_g.glob(f"{U}/*{suffix}")) + sorted(_g.glob(f"{E}/assets/*{suffix}"))
    if not hits:
        raise SystemExit(f"file not found: {suffix}")
    return hits[0]


def _probe(p):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,r_frame_rate,color_transfer:stream_side_data=rotation", "-of", "json", p],
                       capture_output=True, text=True).stdout
    st = json.loads(o)["streams"][0]
    w, h = int(st["width"]), int(st["height"])
    rot = 0
    for sd in st.get("side_data_list", []):
        rot = int(sd.get("rotation", rot) or 0)
    if abs(rot) == 90:
        w, h = h, w
    num, den = st["r_frame_rate"].split("/")
    kind = "hdr" if st.get("color_transfer") == "arib-std-b67" else "sdr"
    return w, h, int(num) / int(den), kind


def src_info(clip):
    """(path, kind, width, height, rate). Named iPhone clips are HLG/HDR 2160x3840; 'b<id>' = b-roll (SDR);
    'u:<file>' = any uploaded video (probed); 'img:<file>' = still image (render, photo)."""
    if clip in CLIP:
        return CLIP[clip], "hdr", 2160, 3840, 30000 / 1001
    if clip.startswith("u:") or clip.startswith("img:"):
        if clip not in _INFO:
            p = _upload(clip.split(":", 1)[1])
            w, h, rate, kind = _probe(p)
            if clip.startswith("img:"):
                kind, rate = "still", 30.0
            _INFO[clip] = (p, kind, w, h, rate)
        return _INFO[clip]
    if clip not in _INFO:
        p = f"{BROLL}/Frame0{clip[1:]}.mov"
        o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate",
                            "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip().split(",")
        num, den = o[2].split("/")
        _INFO[clip] = (p, "sdr", int(o[0]), int(o[1]), int(num) / int(den))
    return _INFO[clip]


FPS = 30
W, H = 1080, 1920
TM = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
      "tonemap=mobius:param=0.3:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
# "Beto Lux v2": denser blacks, clean whites, stones pop, hue untouched
GRADE = ("curves=master='0/0 0.06/0.02 0.25/0.21 0.5/0.48 0.75/0.77 0.92/0.95 1/1',"
         "vibrance=intensity=0.18,unsharp=lx=13:ly=13:la=0.30:cx=5:cy=5:ca=0,unsharp=5:5:0.55:5:5:0")
# b-roll is already graded by the videographer: only a light polish
GRADE_SDR = "curves=master='0/0 0.04/0.02 0.5/0.49 0.96/0.97 1/1',vibrance=intensity=0.08,unsharp=5:5:0.35:5:5:0"
ENC = ["-c:v", "libx264", "-preset", "fast", "-crf", "11", "-pix_fmt", "yuv420p",
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]
CACHE = f"{E}/cache"
os.makedirs(CACHE, exist_ok=True)


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(" ".join(cmd)[:2000]); print(r.stderr[-3000:]); raise SystemExit(1)
    return r


def S(clip, start, dur, zoom=None, cx=None, cy=None, speed=1.0, fx=(), size=(W, H), slowmo=False, reveal=None,
      fit=False, yoff=60):
    """Shot spec. fx: punch, kenburns, kenburns_out, shake, rgb, flash, flash_out, blurin, whip, bw.
    fit=True: show the whole frame (square video, render) over a blurred copy of itself."""
    if clip in CLIP:  # named iPhone clips keep their historical defaults (cache keys)
        zoom = 1.3 if zoom is None else zoom
        cx = 1080 if cx is None else cx
        cy = 1920 if cy is None else cy
    else:
        zoom = 1.0 if zoom is None else zoom
    d = dict(clip=clip, start=start, dur=dur, zoom=zoom, cx=cx, cy=cy, speed=speed,
             fx=list(fx), size=list(size), slowmo=slowmo, reveal=reveal)
    if fit:
        d["fit"] = True; d["yoff"] = yoff
    return d


def render_shot(s):
    key = hashlib.md5(json.dumps([s, GRADE, TM], sort_keys=True).encode()).hexdigest()[:14]
    out = f"{CACHE}/{s['clip']}_{key}.mp4"
    if os.path.exists(out):
        return out
    ow, oh = s["size"]
    path, kind, SW, SH, src_rate = src_info(s["clip"])
    cx = SW // 2 if s["cx"] is None else s["cx"]
    cy = SH // 2 if s["cy"] is None else s["cy"]
    # crop window on the portrait source, keeping the output aspect
    aspect = ow / oh
    ch = int(SH / s["zoom"]) // 2 * 2
    cw = int(ch * aspect) // 2 * 2
    if cw > SW:
        cw = SW // 2 * 2; ch = int(cw / aspect) // 2 * 2
    x = max(0, min(SW - cw, cx - cw // 2)); y = max(0, min(SH - ch, cy - ch // 2))
    n_out = round(s["dur"] * FPS)
    zr = "30000/1001" if (kind == "hdr" and abs(src_rate - 29.97) < 0.01) else f"{src_rate:.6f}"
    eff_speed = s["speed"] * (0.5 if s["slowmo"] else 1.0)
    src_dur = s["dur"] * eff_speed + 0.25
    n_in = int(src_dur * src_rate)
    f = ([TM] if kind == "hdr" else [])
    fx = s["fx"]
    if s.get("fit"):
        f.append(f"split[fa][fb];[fa]scale={ow}:{oh}:force_original_aspect_ratio=increase,crop={ow}:{oh},gblur=sigma=30,"
                 f"eq=brightness=0.03:saturation=0.9[fbg];[fb]scale={ow - 40}:-2:flags=lanczos[ffg];"
                 f"[fbg][ffg]overlay=(W-w)/2:(H-h)/2+{s['yoff']}")
        if "kenburns" in fx:
            f.append(f"zoompan=z='1+0.07*in/{n_in}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={ow}x{oh}:fps={zr}")
        elif "punch" in fx:
            f.append(f"zoompan=z='if(lt(in,8),1+0.08*pow(1-in/8,2),1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={ow}x{oh}:fps={zr}")
    else:
        f.append(f"crop={cw}:{ch}:{x}:{y}")
    if s.get("fit"):
        pass
    elif "punch" in fx:
        f.append(f"zoompan=z='if(lt(in,8),1+0.08*pow(1-in/8,2),1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={ow}x{oh}:fps={zr}")
    elif "kenburns" in fx:
        f.append(f"zoompan=z='1+0.10*in/{n_in}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={ow}x{oh}:fps={zr}")
    elif "kenburns_out" in fx:
        f.append(f"zoompan=z='1.10-0.10*in/{n_in}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={ow}x{oh}:fps={zr}")
    else:
        f.append(f"scale={ow}:{oh}:flags=lanczos")
    f.append(GRADE if kind == "hdr" else GRADE_SDR)
    if kind == "still":
        f.insert(0, "format=yuv420p")
    if s["slowmo"]:
        mr = "60000/1001" if (kind == "hdr" and abs(src_rate - 29.97) < 0.01) else f"{2 * src_rate:.6f}"
        f.append(f"minterpolate=fps={mr}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1")
        f.append("setpts=2*(PTS-STARTPTS)")
    if s["speed"] != 1.0:
        f.append(f"setpts=(PTS-STARTPTS)/{s['speed']}")
    f.append(f"fps={FPS},setsar=1,tpad=stop_mode=clone:stop_duration=2")
    if "bw" in fx:
        f.append("hue=s=0")
    if s["reveal"] is not None:  # black & white -> colour at reveal time (s)
        r = s["reveal"]
        f.append(f"hue=s='if(lt(t,{r}),0,min(1,(t-{r})*5))'")
    if "shake" in fx:
        f.append(f"scale={int(ow*1.08)//2*2}:{int(oh*1.08)//2*2},"
                 f"crop={ow}:{oh}:x='(iw-ow)/2+{int(ow*0.03)}*sin(n*2.3)*exp(-n/6)':y='(ih-oh)/2+{int(oh*0.02)}*cos(n*1.7)*exp(-n/6)'")
    if "rgb" in fx:
        f.append("rgbashift=rh=-14:bh=14:rv=4:bv=-4:enable='lt(n,4)'")
    if "blurin" in fx or "whip" in fx:
        f.append("gblur=sigma=38:sigmaV=0.01:steps=2:enable='lt(n,3)'")
    if "flash" in fx:
        f.append("fade=t=in:st=0:d=0.12:color=white")
    if "flash_out" in fx:
        f.append(f"fade=t=out:st={s['dur']-0.1:.3f}:d=0.1:color=white")
    if "dip" in fx:
        f.append("fade=t=in:st=0:d=0.2:color=black")
    f.append("setsar=1")
    vf = ",".join(f)
    inp = (["-loop", "1", "-framerate", "30", "-t", f"{src_dur:.3f}", "-i", path] if kind == "still"
           else ["-ss", f"{s['start']:.3f}", "-t", f"{src_dur:.3f}", "-i", path])
    run(["ffmpeg", "-v", "error", "-y", *inp,
         "-an", "-vf", vf, "-frames:v", str(n_out), *ENC, out])
    return out


def render_grid(cells, dur, fx=()):
    """2x2 grid of 4 shot specs (each 540x960)."""
    key = hashlib.md5(json.dumps([cells, dur, list(fx), GRADE], sort_keys=True).encode()).hexdigest()[:14]
    out = f"{CACHE}/grid_{key}.mp4"
    if os.path.exists(out):
        return out
    files = []
    for c in cells:
        c = dict(c); c["size"] = [540, 960]; c["dur"] = dur
        files.append(render_shot(c))
    inp = sum((["-i", f] for f in files), [])
    gap = 6
    fc = "".join(f"[{i}:v]settb=1/{FPS},setpts=N/({FPS}*TB)[g{i}];" for i in range(4))
    fc += f"[g0][g1][g2][g3]xstack=inputs=4:layout=0_0|{540+gap}_0|0_{960+gap}|{540+gap}_{960+gap}:fill=0xF6F3EE,scale={W}:{H}"
    if "flash" in fx:
        fc += ",fade=t=in:st=0:d=0.12:color=white"
    fc += "[v]"
    run(["ffmpeg", "-v", "error", "-y", *inp, "-filter_complex", fc, "-map", "[v]",
         "-frames:v", str(round(dur * FPS)), *ENC, out])
    return out


def render_stack(top, bottom, dur):
    """Two shots stacked vertically (each 1080x957, 6 px ivory divider)."""
    key = hashlib.md5(json.dumps([top, bottom, dur, GRADE], sort_keys=True).encode()).hexdigest()[:14]
    out = f"{CACHE}/stack_{key}.mp4"
    if os.path.exists(out):
        return out
    files = []
    for c in (top, bottom):
        c = dict(c); c["size"] = [1080, 956]; c["dur"] = dur
        files.append(render_shot(c))
    fc = (f"[0:v]settb=1/{FPS},setpts=N/({FPS}*TB)[t];[1:v]settb=1/{FPS},setpts=N/({FPS}*TB)[b];"
          f"[t][b]xstack=inputs=2:layout=0_0|0_964:fill=0xF6F3EE,scale={W}:{H},setsar=1[v]")
    run(["ffmpeg", "-v", "error", "-y", "-i", files[0], "-i", files[1], "-filter_complex", fc, "-map", "[v]",
         "-frames:v", str(round(dur * FPS)), *ENC, out])
    return out


def solid(color, dur):
    out = f"{CACHE}/solid_{color}_{dur:.3f}.mp4"
    if not os.path.exists(out):
        run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"color=c={color}:s={W}x{H}:r={FPS}:d={dur:.3f}",
             *ENC, out])
    return out


# ---------------- text layers ----------------


def render_layers(name, layers):
    """layers: dict layer_id -> inner HTML (uses classes from layers2.js CSS). Returns dir."""
    d = f"{E}/layers/{name}"
    os.makedirs(d, exist_ok=True)
    spec = f"{d}/spec.json"
    json.dump(layers, open(spec, "w"), ensure_ascii=False)
    run(["node", f"{HERE}/layers2.js", FONTS, spec, d, LOGO])
    return d


def build(name, items, layers=None, timeline=(), audio=None, out_dir=None, total=None):
    """items: list of (kind, spec) where kind in shot|grid|solid; spec for grid = (cells, dur, fx).
    timeline: list of (layer_id, start, fade_in, end, fade_out, rise_px).
    audio: (events, bed) for sfx.render."""
    files = []
    for kind, sp in items:
        if kind == "shot":
            files.append((render_shot(sp), sp["dur"]))
        elif kind == "grid":
            files.append((render_grid(*sp), sp[1]))
        elif kind == "stack":
            files.append((render_stack(*sp), sp[2]))
        elif kind == "solid":
            files.append((solid(*sp), sp[1]))
    total = total or sum(d for _, d in files)
    ldir = render_layers(name, layers or {})
    inputs = sum((["-i", f] for f, _ in files), [])
    ni = len(files)
    for lid, *_ in timeline:
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{total:.3f}", "-i", f"{ldir}/{lid}.png"]
    wav = f"{E}/audio/{name}.wav"
    P = PY
    events, bed = audio if audio else ([], None)
    run([P, "-I", "-c", f"import sys; sys.path.insert(0, {HERE!r}); import sfx, json; "
         f"sfx.render({total}, json.loads({json.dumps(json.dumps(events))}), {bed!r}, {wav!r})"])
    inputs += ["-i", wav]
    aud = ni + len(timeline)
    fc = "".join(f"[{i}:v]fps={FPS},setsar=1,settb=1/{FPS},setpts=N/({FPS}*TB)[c{i}];" for i in range(ni))
    fc += "".join(f"[c{i}]" for i in range(ni)) + f"concat=n={ni}:v=1:a=0,settb=1/{FPS},setpts=N/({FPS}*TB)[b0];"
    prev = "b0"
    for k, (lid, st, fi, en, fo, rise) in enumerate(timeline):
        idx = ni + k
        chain = "format=rgba"
        if fi > 0: chain += f",fade=t=in:st={st:.3f}:d={fi:.3f}:alpha=1"
        if fo > 0: chain += f",fade=t=out:st={en - fo:.3f}:d={fo:.3f}:alpha=1"
        fc += f"[{idx}:v]{chain}[t{k}];"
        yexp = f"{rise}*pow(max(0\\,1-(t-{st:.3f})/0.45)\\,2)" if rise else "0"
        fc += f"[{prev}][t{k}]overlay=x=0:y='{yexp}':eval=frame:enable='between(t,{st:.3f},{en - 1/FPS/2:.3f})'[b{k+1}];"
        prev = f"b{k+1}"
    fc += f"[{prev}]format=yuv420p[vout]"
    out_dir = out_dir or f"{E}/trials"
    os.makedirs(out_dir, exist_ok=True)
    out = f"{out_dir}/{name}.mp4"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[vout]", "-map", f"{aud}:a",
         "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.2",
         "-pix_fmt", "yuv420p", "-r", str(FPS), "-maxrate", "16M", "-bufsize", "32M",
         "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
         "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    return out, total
