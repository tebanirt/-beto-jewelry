"""pro — beat-synced 'pro edit' engine on top of reelkit.

A pro reel = real licensed music (Mixkit) + cuts on the beat (from beats.py) + xfade transitions
+ kinetic (word-by-word) text + sparkle glints + glow + light SFX, mixed to -14 LUFS.

spec = dict(
  name="P01_x", music="470", start=None (auto best drop) or seconds,
  shots=[dict(shot=S(...), beats=4, tr="zoomin"|"hblur"|"fadewhite"|"fade"|"smoothleft"|"cut"), ...],
  texts=[dict(html=card_words(...), at=beat, until=beat, every=1)],   # word-by-word reveal, one word per `every` beats
  glints=[dict(at=beat, x=540, y=1000, s=1.0)],
  end=dict(beats=8, layers=endcard(...))  # ivory end card, elements reveal on beats
)
"""
import hashlib, json, os, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import reelkit as rk
import beats as bt

E = rk.E
# Mixkit tracks, saved as <id>.mp3 (see README). Never committed: the licence forbids redistributing the music alone.
MUSIC_DIR = os.environ.get("BETO_MUSIC_DIR", f"{rk.WORK}/music")
FPS = rk.FPS
T_DEF = 0.24


# ---------------- assets ----------------
def glint_asset():
    out = f"{rk.CACHE}/glint.mov"
    if os.path.exists(out):
        return out
    N, S = 14, 220
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32) - S / 2
    frames = []
    for i in range(N):
        p = i / (N - 1)
        a = np.sin(np.pi * p) ** 1.5                      # grow then fade
        ang = np.deg2rad(20 * p)
        c, s = np.cos(ang), np.sin(ang)
        xr, yr = c * xx + s * yy, -s * xx + c * yy
        L = S * 0.46 * (0.55 + 0.45 * a)
        w = 1.6
        ray = np.exp(-(yr ** 2) / (2 * w ** 2)) * np.exp(-np.abs(xr) / (L / 3)) + \
              np.exp(-(xr ** 2) / (2 * w ** 2)) * np.exp(-np.abs(yr) / (L / 3))
        d1, d2 = (xr + yr) / np.sqrt(2), (xr - yr) / np.sqrt(2)
        ray += 0.35 * (np.exp(-(d2 ** 2) / 2) * np.exp(-np.abs(d1) / (L / 6)) +
                       np.exp(-(d1 ** 2) / 2) * np.exp(-np.abs(d2) / (L / 6)))
        core = np.exp(-(xx ** 2 + yy ** 2) / (2 * (S * 0.035) ** 2))
        halo = 0.35 * np.exp(-(xx ** 2 + yy ** 2) / (2 * (S * 0.11) ** 2))
        alpha = np.clip((ray + core + halo) * a, 0, 1)
        rgba = np.zeros((S, S, 4), np.uint8)
        rgba[..., 0] = 255; rgba[..., 1] = 252; rgba[..., 2] = 240
        rgba[..., 3] = (alpha * 255).astype(np.uint8)
        frames.append(rgba.tobytes())
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{S}x{S}",
                        "-r", str(FPS), "-i", "-", "-c:v", "qtrle", "-pix_fmt", "argb", out],
                       input=b"".join(frames), capture_output=True)
    if p.returncode:
        print(p.stderr.decode()[-2000:]); raise SystemExit(1)
    return out


def sweep_asset():
    """A soft diagonal band of light (RGBA PNG, 700x1920) that slides across the frame: the 'light sweep' of jewelry reels."""
    out = f"{rk.CACHE}/sweep.png"
    if os.path.exists(out):
        return out
    W, H = 700, 1920
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = (xx - W / 2) - 0.32 * (yy - H / 2)          # tilted band
    a = np.exp(-(d ** 2) / (2 * 70.0 ** 2)) * 0.85 + np.exp(-(d ** 2) / (2 * 14.0 ** 2)) * 0.15
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., :3] = (255, 252, 244)
    rgba[..., 3] = (np.clip(a, 0, 1) * 255).astype(np.uint8)
    p = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-i", "-",
                        "-frames:v", "1", out], input=rgba.tobytes(), capture_output=True)
    if p.returncode:
        print(p.stderr.decode()[-2000:]); raise SystemExit(1)
    return out


# ---------------- text ----------------
def card_words(text, over=None, size="s86", top=300, det=None):
    """Return list of HTML stages revealing `text` word by word (words separated by spaces; '|' = line break)."""
    raw = text.replace("|", " | ").split()
    words = []
    for w in raw:  # keep French punctuation attached to the previous word (no orphan "?" stage)
        if words and words[-1] != "|" and w in ("?", "!", ":", ";", "»", "…"):
            words[-1] += "&nbsp;" + w
        else:
            words.append(w)
    real = [w for w in words if w != "|"]
    stages = []
    for j in range(1, len(real) + 1):
        k = 0; parts = []
        for w in words:
            if w == "|":
                parts.append("<br>"); continue
            vis = k < j; k += 1
            parts.append(f'<span style="opacity:{1 if vis else 0}">{w}</span>')
        body = " ".join(parts).replace(" <br> ", "<br>")
        h = f'<div class="card pad" style="top:{top}px">'
        if over:
            h += f'<span class="over">{over}</span>'
        h += f'<div class="serif {size}">{body}</div>'
        if det:
            h += f'<span class="det" style="opacity:{1 if j == len(real) else 0}">{det}</span>'
        stages.append(h + "</div>")
    return stages


def end_overlay(title, cta, place, top=270):
    """Compact end card drawn OVER the last shot (the ring stays visible below it).
    Layers: e_logo (ivory panel + logo), e_t (title), e_c (button + place). Keeps the 14 % top safe zone."""
    lines = title.count("<br>") + 1
    t_y = top + 175
    c_y = t_y + 78 * lines + 34
    h = c_y + 150 - top
    return {
        "e_logo": (f'<div class="card" style="top:{top}px;width:820px;height:{h}px"></div>'
                   f'<img class="logo" style="top:{top + 42}px;width:250px" src="%LOGO%">'),
        "e_t": f'<div class="ctr e1" style="top:{t_y}px;font-size:66px">{title}</div>',
        "e_c": (f'<div class="btn" style="top:{c_y}px;font-size:28px;padding:18px 38px">{cta}</div>'
                f'<div class="ctr e4" style="top:{c_y + 100}px;font-size:18px">{place}</div>'),
    }


# ---------------- build ----------------
def _run(cmd):
    return rk.run(cmd)


def build(spec, out_dir=None):
    name = spec["name"]
    if spec.get("music"):
        mp3 = os.path.join(MUSIC_DIR, f"{spec['music']}.mp3")
        info = bt.analyze(mp3)
    else:  # "app" version: grid at the BPM of a trending song added later in the Instagram app
        mp3 = None
        bpm = float(spec["bpm"])
        info = dict(bpm=bpm, beats=list(np.arange(0, 600) * 60.0 / bpm))
        spec.setdefault("start", 0.0)
    beats = np.array(info["beats"])
    total_beats = sum(s["beats"] for s in spec["shots"]) + spec["end"]["beats"]
    approx = total_beats * 60 / info["bpm"]
    start = spec.get("start")
    if start is None:
        start = bt.best_start(info, approx)
    b0 = int(np.searchsorted(beats, start - 1e-3))
    need = b0 + total_beats + 1
    if need >= len(beats):  # extrapolate grid if the track ends
        per = 60 / info["bpm"]
        beats = np.concatenate([beats, beats[-1] + per * np.arange(1, need - len(beats) + 2)])
    bidx = np.arange(len(beats))
    t_of = lambda k: float(np.interp(b0 + k, bidx, beats) - beats[b0])  # time (s) of (fractional) beat k
    # cut points
    cuts, acc = [], 0
    for s in spec["shots"]:
        acc += s["beats"]; cuts.append(acc)
    total = t_of(total_beats)
    overlay = bool(spec["end"].get("overlay"))
    # render shots with overlap T
    files, trs = [], []
    if overlay:  # the last shot continues under the end card: no ivory solid
        nshots = len(spec["shots"])
        bounds = [0] + [t_of(c) for c in cuts[:-1]] + [total]
        tr_list = [s.get("tr", "fade") for s in spec["shots"][:-1]]
    else:
        nshots = len(spec["shots"]) + 1  # + end card
        bounds = [0] + [t_of(c) for c in cuts] + [total]
        tr_list = [s.get("tr", "fade") for s in spec["shots"]]
    Ts = [(0.034 if tr == "cut" else spec.get("T", T_DEF)) for tr in tr_list]
    for i in range(nshots):
        a, b = bounds[i], bounds[i + 1]
        Tin = Ts[i - 1] if i > 0 else 0
        Tout = Ts[i] if i < len(Ts) else 0
        dur = (b - a) + Tin / 2 + Tout / 2
        if i < len(spec["shots"]):
            sh = dict(spec["shots"][i]["shot"]); sh["dur"] = round(dur, 3)
            files.append(rk.render_shot(sh))
        else:
            files.append(rk.solid("0xF6F3EE", round(dur + 0.1, 3)))
    # layers: texts (word stages) + end card
    layers, tl = {}, []
    for ti, t in enumerate(spec.get("texts", [])):
        stages = t["html"]
        nst = len(stages)
        win = t["until"] - t["at"]
        hold = max(1.0, 0.35 * win)          # full text stays readable at the end
        step = t.get("every", 1)
        if nst > 1:
            step = min(step, (win - hold) / (nst - 1))
        starts = [t_of(t["at"] + j * step) for j in range(nst)]
        for j, h in enumerate(stages):
            lid = f"t{ti}_{j}"
            layers[lid] = h
            st = starts[j]
            # each stage stays under the next one until it has faded in: no blink between words
            en = t_of(t["until"]) if j == nst - 1 else starts[j + 1] + 0.12
            tl.append((lid, st, 0.12 if j == 0 else 0.09, en, 0.0, 10 if j == 0 else 0))
    end = spec["end"]
    e0 = len(cuts) and cuts[-1]
    for k, (lid, html) in enumerate(end["layers"].items()):
        layers[f"e_{lid}"] = html
        st = t_of(e0 + end.get("reveal", [0, 1, 2, 3])[min(k, 3)])
        tl.append((f"e_{lid}", st, 0.35, total, 0.0, 14))
    ldir = rk.render_layers(name, layers)
    # ffmpeg graph
    inputs = sum((["-i", f] for f in files), [])
    n = len(files)
    for lid, *_ in tl:
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{total:.3f}", "-i", f"{ldir}/{lid}.png"]
    gl = spec.get("glints", [])
    gpath = glint_asset() if gl else None
    for g in gl:
        inputs += ["-i", gpath]
    sw = spec.get("sweeps", [])
    swpath = sweep_asset() if sw else None
    for w in sw:
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{total:.3f}", "-i", swpath]
    # each shot is padded (last frame cloned): xfade needs the first input to last at least offset + duration,
    # and frame rounding can leave a shot one frame short, which silently drops every later shot.
    fc = "".join(f"[{i}:v]fps={FPS},setsar=1,settb=1/{FPS},setpts=N/({FPS}*TB),format=yuv420p,"
                 f"tpad=stop_mode=clone:stop_duration=0.25[v{i}];" for i in range(n))
    prev, D = "v0", bounds[1] + (Ts[0] / 2 if Ts else 0)
    for i in range(1, n):
        tr = tr_list[i - 1] if i - 1 < len(tr_list) else "fade"
        T = Ts[i - 1] if i - 1 < len(Ts) else T_DEF
        xt = "fade" if tr == "cut" else tr
        off = D - T
        fc += f"[{prev}][v{i}]xfade=transition={xt}:duration={T:.3f}:offset={off:.3f}[x{i}];"
        prev = f"x{i}"
        D = bounds[i + 1] + (Ts[i] / 2 if i < len(Ts) else 0)
    k0 = n
    for k, (lid, st, fi, en, fo, rise) in enumerate(tl):
        idx = k0 + k
        chain = "format=rgba"
        if fi > 0: chain += f",fade=t=in:st={st:.3f}:d={fi:.3f}:alpha=1"
        fc += f"[{idx}:v]{chain}[t{k}];"
        yexp = f"{rise}*pow(max(0\\,1-(t-{st:.3f})/0.4)\\,2)" if rise else "0"
        fc += f"[{prev}][t{k}]overlay=x=0:y='{yexp}':eval=frame:enable='between(t,{st:.3f},{en - 1 / FPS / 2:.3f})'[o{k}];"
        prev = f"o{k}"
    g0 = k0 + len(tl)
    for gi, g in enumerate(gl):
        st = t_of(g["at"]); sz = int(220 * g.get("s", 1.0)) // 2 * 2
        fc += (f"[{g0 + gi}:v]format=argb,scale={sz}:{sz},setpts=PTS-STARTPTS+{st:.3f}/TB[gl{gi}];"
               f"[{prev}][gl{gi}]overlay=x={g['x'] - sz // 2}:y={g['y'] - sz // 2}:eof_action=pass[g{gi}];")
        prev = f"g{gi}"
    s0 = g0 + len(gl)
    for si, w in enumerate(sw):  # light sweeps: band slides left to right over `beats`
        st = t_of(w["at"]); en = t_of(w["at"] + w.get("beats", 2)); dur = max(en - st, 0.3)
        al = w.get("alpha", 0.32)
        fc += (f"[{s0 + si}:v]format=rgba,colorchannelmixer=aa={al}[sw{si}];"
               f"[{prev}][sw{si}]overlay=x='-700+(t-{st:.3f})/{dur:.3f}*1780':y=0:eval=frame:"
               f"enable='between(t,{st:.3f},{en:.3f})'[w{si}];")
        prev = f"w{si}"
    fc += f"[{prev}]noise=alls=3:allf=t,format=yuv420p[vout]"
    # audio: music segment + light sfx
    sfx_events = []
    for i, tr in enumerate(tr_list):
        tcut = bounds[i + 1]
        if tr in ("hblur", "smoothleft", "smoothright", "slideleft", "zoomin"):
            sfx_events.append((tcut, "whoosh_rev", 0.35))
        if tr == "fadewhite":
            sfx_events.append((tcut, "impact", 0.35))
    for g in gl:
        sfx_events.append((t_of(g["at"]), "sparkle", 0.45))
    sfx_events.append((t_of(cuts[-1]), "impact", 0.3))
    wav = f"{E}/audio/{name}_sfx.wav"
    _run([rk.PY, "-I", "-c",
          f"import sys; sys.path.insert(0, {os.path.dirname(os.path.abspath(__file__))!r}); import sfx, json; "
          f"sfx.render({total + 0.2}, json.loads({json.dumps(json.dumps(sfx_events))}), None, {wav!r}, master_gain=0.6)"])
    ai = g0 + len(gl) + len(sw)
    if mp3 is None:  # app version: silent track, the song is chosen in Instagram
        inputs += ["-f", "lavfi", "-t", f"{total + 0.5:.3f}", "-i", "anullsrc=r=48000:cl=stereo"]
        fc += f";[{ai}:a]anull[aout]"
    else:
        inputs += ["-ss", f"{beats[b0]:.3f}", "-t", f"{total + 0.5:.3f}", "-i", mp3, "-i", wav]
        fc += (f";[{ai}:a]aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.04,"
               f"afade=t=out:st={total - 0.9:.3f}:d=0.9,volume=1.0[mus];"
               f"[{ai + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.55[fx];"
               f"[mus][fx]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false[aout]")
    out_dir = out_dir or f"{E}/pro"
    os.makedirs(out_dir, exist_ok=True)
    out = f"{out_dir}/{name}.mp4"
    _run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[vout]", "-map", "[aout]",
          "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.2",
          "-pix_fmt", "yuv420p", "-r", str(FPS), "-maxrate", "16M", "-bufsize", "32M",
          "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
          "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    return out, total, info["bpm"], float(beats[b0])
