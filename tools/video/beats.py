"""Music analysis for beat-synced edits: tempo, beats, downbeats, best (most energetic) section.

analyze(path) -> dict(bpm, beats[s], downbeats[s], duration, rms_per_beat)
best_start(info, seconds) -> start time (s) on a downbeat where the energy is highest (prefers a 'drop').
"""
import json, subprocess, sys
import numpy as np
from scipy import signal

SR = 22050
HOP = 512


def load(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def onset_envelope(y):
    f, t, Z = signal.stft(y, fs=SR, nperseg=2048, noverlap=2048 - HOP, boundary=None, padded=False)
    S = np.log1p(30 * np.abs(Z))
    flux = np.maximum(0, np.diff(S, axis=1)).sum(axis=0)
    flux = np.concatenate([[0], flux])
    flux = flux - signal.medfilt(flux, 31)
    flux = np.maximum(flux, 0)
    flux /= (flux.std() + 1e-9)
    low = S[(f >= 30) & (f <= 150)].sum(axis=0)  # kick band, for downbeats
    rms = np.sqrt((np.abs(Z) ** 2).mean(axis=0))
    return flux, low, rms


def tempo(env, lo=70, hi=175):
    fps = SR / HOP
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    lags = np.arange(len(ac))
    bpm = 60 * fps / np.maximum(lags, 1)
    m = (bpm >= lo) & (bpm <= hi)
    prior = np.exp(-0.5 * (np.log2(bpm / 115.0) / 0.9) ** 2)
    score = np.where(m, ac * prior, 0)
    lag = int(np.argmax(score))
    # refine with neighbours
    return 60 * fps / lag, lag


def track(env, period, alpha=100.0):
    n = len(env)
    score = env.copy().astype(float)
    back = -np.ones(n, dtype=int)
    p = period
    for t in range(n):
        lo, hi = int(t - 2 * p), int(t - p / 2)
        if hi <= 0:
            continue
        lo = max(lo, 0)
        taus = np.arange(lo, hi)
        pen = -alpha * (np.log((t - taus) / p)) ** 2
        cand = score[taus] + pen
        k = int(np.argmax(cand))
        score[t] = env[t] + cand[k]
        back[t] = taus[k]
    # end: best in last period
    t = int(np.argmax(score[-int(p):])) + n - int(p)
    beats = []
    while t >= 0:
        beats.append(t)
        t = back[t]
    return np.array(beats[::-1])


def analyze(path):
    y = load(path)
    env, low, rms = onset_envelope(y)
    bpm, lag = tempo(env)
    beats = track(env, lag)
    fps = SR / HOP
    bt = beats / fps
    # downbeat phase: the phase (0-3) whose beats carry the most kick energy
    lowb = low[beats]
    phase = int(np.argmax([lowb[i::4].mean() if len(lowb[i::4]) else 0 for i in range(4)]))
    down = bt[phase::4]
    rb = np.array([rms[beats[i]:beats[i + 1]].mean() if i + 1 < len(beats) else rms[beats[i]:].mean()
                   for i in range(len(beats))])
    return dict(path=path, bpm=round(float(bpm), 2), beats=[round(float(x), 4) for x in bt],
                downbeats=[round(float(x), 4) for x in down], duration=len(y) / SR,
                rms_per_beat=[round(float(x), 6) for x in rb], phase=phase)


def best_start(info, seconds, avoid_end=4.0):
    """Downbeat start maximising mean energy over `seconds`, with a bonus for a jump in energy (drop)."""
    bt = np.array(info["beats"]); rb = np.array(info["rms_per_beat"]); down = info["downbeats"]
    best, best_s = -1, down[0] if down else 0
    for d in down:
        if d + seconds > info["duration"] - avoid_end:
            break
        i0 = int(np.searchsorted(bt, d))
        i1 = int(np.searchsorted(bt, d + seconds))
        if i1 - i0 < 4:
            continue
        cur = rb[i0:i1].mean()
        prev = rb[max(0, i0 - 8):i0].mean() if i0 >= 4 else cur
        sc = cur + 0.6 * max(0, cur - prev)
        if sc > best:
            best, best_s = sc, d
    return float(best_s)


if __name__ == "__main__":
    for p in sys.argv[1:]:
        a = analyze(p)
        s = best_start(a, 12)
        print(f"{p.split('/')[-1]}: {a['bpm']} BPM, {len(a['beats'])} beats, dur {a['duration']:.0f}s, "
              f"mean rms {np.mean(a['rms_per_beat']):.4f}, best 12s start {s:.2f}s")
