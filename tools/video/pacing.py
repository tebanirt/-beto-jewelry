"""Reading pace for every reel (Rayane, 18 Nov 2026: "les vidéos sont trop rapides... il faut laisser le temps aux gens de lire").

pro.build() calls pace() before timing anything, so every reel, old or new, follows the same rule:
- each caption stays on screen at least READ_BASE + characters / READ_CPS seconds (never under MIN_CARD; the hook,
  the first caption, never under MIN_HOOK). 13 characters a second is slower than subtitle norms (Netflix allows
  about 17 to 20 for adults), because a reel is read on a phone, often while the thumb is still moving;
- no shot is shorter than MIN_SHOT (no machine-gun cuts);
- the timeline is stretched piecewise, on whole beats, so cuts still land on the music.
A caption can ask for a shorter hold on purpose (a suspense beat such as « 3. … ») with "min_s".
A spec can opt out with "pace": False (only to reproduce an old file exactly).
"""
import html as _html
import math
import os
import re
import subprocess

READ_CPS = float(os.environ.get("REEL_READ_CPS", 13))
READ_BASE = float(os.environ.get("REEL_READ_BASE", 0.7))
MIN_CARD = float(os.environ.get("REEL_MIN_CARD", 2.0))
MIN_HOOK = float(os.environ.get("REEL_MIN_HOOK", 2.5))
MIN_SHOT = float(os.environ.get("REEL_MIN_SHOT", 2.0))


def text_of(t):
    """Visible text of a caption: its last stage (the full text), without tags."""
    h = t["html"][-1] if isinstance(t["html"], (list, tuple)) else t["html"]
    h = re.sub(r"<br\s*/?>", " ", h)
    h = re.sub(r"<[^>]+>", "", h)
    return re.sub(r"\s+", " ", _html.unescape(h)).strip()


def read_seconds(t, first=False):
    if "min_s" in t:
        return float(t["min_s"])
    n = len(text_of(t))
    return max(MIN_HOOK if first else MIN_CARD, READ_BASE + n / READ_CPS)


def pace(spec, bpm):
    """Return a copy of spec whose shot and caption beats leave time to read. Prints the hold of each caption."""
    import copy
    if spec.get("pace") is False:
        return spec
    s = copy.deepcopy(spec)
    bps = bpm / 60.0
    shots, texts = s["shots"], s.get("texts", [])
    bounds, acc = [0], 0
    for sh in shots:
        acc += sh["beats"]; bounds.append(acc)
    pts = sorted(set(bounds) | {t["at"] for t in texts} | {t["until"] for t in texts})
    seg = {(a, b): 1.0 for a, b in zip(pts, pts[1:])}

    def need(a, b, seconds):
        cur = b - a
        want = seconds * bps
        if cur <= 0 or want <= cur:
            return
        f = want / cur
        for (x, y) in seg:
            if x >= a and y <= b:
                seg[(x, y)] = max(seg[(x, y)], f)

    for i, t in enumerate(texts):
        need(t["at"], t["until"], read_seconds(t, first=(i == 0)))
    for a, b in zip(bounds, bounds[1:]):
        need(a, b, MIN_SHOT)
    new = {pts[0]: 0}
    q = 0
    for (a, b) in zip(pts, pts[1:]):
        q += max(1, math.ceil((b - a) * seg[(a, b)] - 1e-6)) if b > a else 0
        new[b] = q
    for i, sh in enumerate(shots):
        sh["beats"] = new[bounds[i + 1]] - new[bounds[i]]
    for t in texts:
        t["at"], t["until"] = new[t["at"]], new[t["until"]]
    report = ", ".join(f"{(t['until'] - t['at']) / bps:.1f}s" for t in texts)
    print(f"  pace {s.get('name', '')}: {new[pts[-1]] / bps:.1f}s total; captions {report}", flush=True)
    return s


_DUR = {}


def clip_seconds(path):
    if path not in _DUR:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                             capture_output=True, text=True).stdout.strip()
        _DUR[path] = float(out) if out else 0.0
    return _DUR[path]


def fit_start(sh, path):
    """A longer shot may run past the end of its clip: start it earlier instead (never freeze, never loop)."""
    total = clip_seconds(path)
    if not total:
        return sh
    use = sh["dur"] * sh.get("speed", 1.0) * (0.5 if sh.get("slowmo") else 1.0) + 0.3
    if sh["start"] + use > total:
        sh["start"] = round(max(0.0, total - use), 3)
    return sh
