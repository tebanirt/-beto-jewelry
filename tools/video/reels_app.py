"""Silent « _APP » versions of the daily REGULAR reel (Rayane, 15 Nov 2026: option 1). He posts it himself from his phone
and adds a real trending song in the Instagram app; the cuts already fall on that song's beat.
- T06_avis_parfait_APP: « Angel of My Dreams » (JADE), 128 BPM (Tunebat, SongBPM), the « too pretty to be real » trend.
- R02_qui_est_rayane_APP: « Hold On, We're Going Home » (Drake, Majid Jordan), 100 BPM (Tunebat, getsongbpm).
scale() stretches the beat grid so the cards keep about the same reading time as the original edit.
Usage: python3 reels_app.py [T06_avis_parfait_APP ...]"""
import sys, os, copy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pro
import reels_wave18 as w18
import reels_wave20 as w20

REELS = {}


def app(spec, bpm, k=1.0):
    s = copy.deepcopy(spec)
    s["name"] += "_APP"
    s["music"] = None
    s["bpm"] = bpm
    if k != 1.0:
        for sh in s["shots"]:
            sh["beats"] = max(1, round(sh["beats"] * k))
        for t in s["texts"]:
            t["at"] = round(t["at"] * k); t["until"] = round(t["until"] * k)
        s["end"]["beats"] = max(1, round(s["end"]["beats"] * k))
        total = sum(sh["beats"] for sh in s["shots"])
        s["texts"][-1]["until"] = min(s["texts"][-1]["until"], total)
    return s


REELS["T06_avis_parfait_APP"] = lambda: app(w18.T06_avis_parfait(), 128, 1.4)
REELS["R02_qui_est_rayane_APP"] = lambda: app(w20.R02_qui_est_rayane(), 100)

if __name__ == "__main__":
    names = sys.argv[1:] or list(REELS)
    for n in names:
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
