"""Royalty-free sound design for Beto Jewelry reels (everything synthesised).

render(total, events, bed, out_wav)
  events: list of (time_s, kind, gain) with kind in
          whoosh, whoosh_rev, impact, sparkle, tick, riser, snap, swell
  bed:    None | "lux" | "velocity" | "ambient" | "edu"
"""
import numpy as np
from scipy import signal
import wave

SR = 48000
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(7)


def _t(d):
    return np.arange(int(d * SR)) / SR


def _env(n, a, d, curve=6.0):
    """attack seconds a, then exponential decay to ~0 over remaining."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-curve * (t - a) / max(d, 1e-4)))
    return e


def _bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def _lp(x, f, order=2):
    sos = signal.butter(order, f, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def _hp(x, f, order=2):
    sos = signal.butter(order, f, btype="high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def _reverb(x, decay=1.6, mix=0.25, seed=1):
    r = np.random.default_rng(seed)
    n = int(decay * SR)
    ir = r.standard_normal(n) * np.exp(-6.0 * np.arange(n) / n)
    ir = _lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = signal.fftconvolve(x, ir)[: len(x)]
    return (1 - mix) * x + mix * wet


# ---------- one-shots (mono) ----------
def kick(gain=1.0, hard=False):
    d = 0.5 if not hard else 0.9
    t = _t(d)
    f = 45 + (150 if hard else 110) * np.exp(-t * (28 if hard else 35))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * (4.5 if hard else 7))
    click = _hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 300) * 0.25
    x = body + click
    if hard:
        x = np.tanh(2.2 * x)
    return gain * x


def hat(gain=0.25, open_=False):
    t = _t(0.25 if open_ else 0.06)
    x = _hp(rng.standard_normal(len(t)), 7000, 4) * np.exp(-t * (14 if open_ else 70))
    return gain * x


def snap(gain=0.4):
    t = _t(0.25)
    x = np.zeros(len(t))
    for off in (0, 0.009, 0.018):  # clap = three tight bursts
        i = int(off * SR)
        b = _bp(rng.standard_normal(len(t) - i), 900, 3500) * np.exp(-np.arange(len(t) - i) / SR * 38)
        x[i:] += b
    return gain * _reverb(x, 0.6, 0.3) / 2.2


def whoosh(dur=0.42, gain=0.5, reverse=False):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    # sweep a band-pass centre from 300 Hz to 5 kHz using short overlapping blocks
    out = np.zeros(n)
    blk = 512
    win = np.hanning(blk * 2)
    for s in range(0, n - blk * 2, blk):
        p = s / n
        fc = 300 * (5000 / 300) ** p
        seg = _bp(noise[s:s + blk * 2], max(80, fc * 0.6), min(20000, fc * 1.6), 1)
        out[s:s + blk * 2] += seg * win
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    x = out * env
    if reverse:
        x = x[::-1]
    return gain * x / (np.max(np.abs(x)) + 1e-9)


def impact(gain=0.9):
    t = _t(1.6)
    f = 32 + 48 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    crack = _lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 22) * 0.6
    x = _reverb(boom + crack, 1.8, 0.22, seed=3)
    return gain * np.tanh(1.6 * x) / 1.1


def sparkle(gain=0.35, n_ting=7, spread=0.35):
    d = spread + 0.9
    x = np.zeros(int(d * SR))
    for _ in range(n_ting):
        f0 = rng.uniform(2600, 7800)
        st = int(rng.uniform(0, spread) * SR)
        tt = _t(0.8)
        tone = (np.sin(2 * np.pi * f0 * tt) + 0.35 * np.sin(2 * np.pi * f0 * 2.76 * tt)) * np.exp(-tt * rng.uniform(5, 9))
        e = min(len(tone), len(x) - st)
        x[st:st + e] += tone[:e] * rng.uniform(0.4, 1.0)
    return gain * _reverb(x, 1.4, 0.35, seed=5) / 3.0


def riser(dur=1.5, gain=0.35):
    t = _t(dur)
    noise = _hp(rng.standard_normal(len(t)), 1200)
    f = 220 * (4 ** (t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    env = (t / dur) ** 2.2
    return gain * (noise * 0.5 + tone) * env


def swell(dur=1.0, gain=0.3):
    return riser(dur, gain)[::-1][::-1] * 1.0


def tick(gain=0.25):
    t = _t(0.03)
    return gain * _hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 160)


# ---------- beds (stereo) ----------
NOTE = {"A2": 110.0, "F2": 87.31, "C3": 130.81, "G2": 98.0, "D3": 146.83, "E2": 82.41}


def _saw(f, t, detune=0.0):
    ph = (f * (1 + detune)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def _pad(chord_freqs, d):
    t = _t(d)
    x = np.zeros(len(t))
    for f in chord_freqs:
        for dt in (-0.004, 0.0, 0.005):
            x += _saw(f, t, dt)
    x = _lp(x / (3 * len(chord_freqs)), 1400, 2)
    a = min(0.35, d / 3)
    env = np.minimum(1, t / a) * np.minimum(1, (d - t) / 0.25)
    return x * env


CHORDS = [  # Am9 - Fmaj7 - C(add9) - G6  (soft, "luxury")
    [220.0, 261.63, 329.63, 392.0, 493.88],
    [174.61, 220.0, 261.63, 329.63],
    [261.63, 293.66, 329.63, 392.0],
    [196.0, 246.94, 293.66, 329.63],
]
ROOTS = [55.0, 43.65, 65.41, 49.0]


def bed(kind, total):
    n = int(total * SR) + SR
    L = np.zeros(n)
    R = np.zeros(n)

    def put(sig, t0, pan=0.0, g=1.0):
        i = int(t0 * SR)
        if i >= n:
            return
        e = min(len(sig), n - i)
        L[i:i + e] += sig[:e] * g * (1 - max(0, pan))
        R[i:i + e] += sig[:e] * g * (1 + min(0, pan))

    bars = int(np.ceil(total / (4 * BEAT))) + 1
    if kind in ("lux", "edu", "ambient"):
        for b in range(bars):
            ch = CHORDS[b % 4]
            p = _pad(ch, 4 * BEAT + 0.3)
            gp = 0.16 if kind != "ambient" else 0.22
            put(p, b * 4 * BEAT, -0.25, gp)
            put(np.roll(p, 400), b * 4 * BEAT, 0.25, gp)
            if kind != "ambient":
                t = _t(4 * BEAT)
                sub = np.sin(2 * np.pi * ROOTS[b % 4] * t) * np.minimum(1, t / 0.02) * np.exp(-t * 0.6)
                put(sub, b * 4 * BEAT, 0, 0.35)
        if kind in ("lux", "edu"):
            steps = int(total / (BEAT / 2)) + 2
            for s in range(steps):
                tt = s * BEAT / 2
                if s % 4 == 0:
                    put(kick(0.75 if kind == "lux" else 0.5), tt)
                if s % 4 == 2 and kind == "lux":
                    put(snap(0.28), tt, 0.1)
                put(hat(0.10 if s % 2 else 0.06), tt, 0.3 if s % 2 else -0.3)
        if kind == "edu":  # soft pluck arpeggio
            arp = [440.0, 523.25, 659.25, 783.99, 659.25, 523.25]
            steps = int(total / (BEAT / 2)) + 2
            for s in range(steps):
                f = arp[s % len(arp)] * (0.5 if (s // 8) % 2 else 1)
                t = _t(0.5)
                pl = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 9)
                put(pl, s * BEAT / 2, 0.4 if s % 2 else -0.4, 0.07)
    elif kind == "velocity":  # dark, hard, cowbell-phonk-ish at 120 BPM
        steps = int(total / (BEAT / 4)) + 4  # 16ths
        bell_pat = [0, 3, 6, 8, 11, 14]  # 16th positions in a bar
        bell_notes = [800, 800, 950, 710, 800, 1070]
        for s in range(steps):
            tt = s * BEAT / 4
            pos = s % 16
            if pos in (0, 6, 10):
                put(kick(0.95, hard=True), tt)
            if pos in (4, 12):
                put(snap(0.5), tt)
            if pos % 2 == 0:
                put(hat(0.09), tt, 0.25)
            if pos in bell_pat:
                f = bell_notes[bell_pat.index(pos)]
                t = _t(0.22)
                cb = signal.square(2 * np.pi * f * t) + signal.square(2 * np.pi * f * 1.48 * t)
                cb = _bp(cb, 500, 4000) * np.exp(-t * 18)
                put(cb, tt, -0.15, 0.10)
        for b in range(bars):
            t = _t(4 * BEAT)
            f = ROOTS[b % 4]
            sub = np.tanh(2.5 * np.sin(2 * np.pi * f * t)) * np.exp(-t * 0.9)
            put(sub, b * 4 * BEAT, 0, 0.38)
    return L, R


def render(total, events, bed_kind, out_wav, master_gain=1.0):
    n = int(total * SR)
    if bed_kind:
        L, R = bed(bed_kind, total)
        L, R = L[:n], R[:n]
    else:
        L = np.zeros(n)
        R = np.zeros(n)
    for ev in events:
        t0, kind = ev[0], ev[1]
        g = ev[2] if len(ev) > 2 else 1.0
        sig = {
            "whoosh": lambda: whoosh(0.42, 0.55),
            "whoosh_rev": lambda: whoosh(0.5, 0.5, reverse=True),
            "impact": lambda: impact(0.9),
            "sparkle": lambda: sparkle(0.45),
            "tick": lambda: tick(0.35),
            "riser": lambda: riser(1.4, 0.35),
            "snap": lambda: snap(0.5),
            "kick": lambda: kick(1.0, hard=True),
        }[kind]()
        if kind in ("whoosh_rev", "riser"):
            t0 = t0 - len(sig) / SR  # end on the cut
        i = int(max(0, t0) * SR)
        e = min(len(sig), n - i)
        if e <= 0:
            continue
        pan = rng.uniform(-0.3, 0.3)
        L[i:i + e] += sig[:e] * g * (1 - max(0, pan))
        R[i:i + e] += sig[:e] * g * (1 + min(0, pan))
    st = np.stack([L, R], 1)
    # fades + loudness (~ -14 LUFS-ish via RMS target) + soft limiter
    fade = int(0.05 * SR)
    st[:fade] *= np.linspace(0, 1, fade)[:, None]
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    rms = np.sqrt(np.mean(st ** 2)) + 1e-9
    st *= (0.16 / rms) * master_gain
    st = np.tanh(st * 1.15) / np.tanh(1.15)
    st = np.clip(st * 0.95, -1, 1)
    pcm = (st * 32767).astype(np.int16)
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return out_wav


if __name__ == "__main__":
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/sfx_test.wav"
    ev = [(0.0, "impact"), (1.0, "whoosh"), (1.5, "sparkle"), (2.0, "whoosh_rev"), (2.0, "impact"), (3.0, "tick")]
    for k in ("lux", "velocity", "ambient", "edu"):
        render(6.0, ev, k, out.replace(".wav", f"_{k}.wav"))
    print("ok")
