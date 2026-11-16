"""Native-Instagram style (16 Nov 2026). Rayane: « je trouve que ça fait beaucoup trop AI… comment les rendre plus
humaines, plus dynamiques, plus cool, plus stylées, plus trendy et plus professionnelles ? »

What made the earlier edits read as "AI / template": the same ivory card in the middle of every video, serif text
revealed word by word, the logo end card, soft crossfades, stock-like ambient music. Native reels from real creators
use the app's own look: a white pill hook, bold white captions with an outline (auto-caption style), hard cuts on
the beat every 1 to 2 beats, punch-ins, first-person text, and no end card (the call to action is a caption).
"""
import sys
import pro
from reelkit import S


def b(cid, start, **kw):
    return S("b" + str(cid), start, 1, **kw)


def pill(lines, top=330):
    return [f'<div class="pillw" style="top:{top}px">' + "<br>".join(f'<span class="pill">{l}</span>' for l in lines) + "</div>"]


def cap(html, top=1180):
    return [f'<div class="nat" style="top:{top}px">{html}</div>']


def N01_avis_natif():
    """The only format that passed the 72 h bar (T01: Rayane + verbatim Google reviews), re-cut in the native style."""
    shots = [
        dict(shot=b(1620314, 1.6, fx=["kenburns"]), beats=3, tr="cut"),           # Rayane talking: hook
        dict(shot=b(1619438, 1.0, fx=["punch"]), beats=2, tr="cut"),              # Rayane shows stones
        dict(shot=b(1656960, 0.4, slowmo=True, fx=["kenburns", "glow"]), beats=2, tr="cut"),  # round solitaire
        dict(shot=b(1617419, 2.0, fx=["punch"]), beats=2, tr="cut"),              # Rayane
        dict(shot=b(1626012, 0.4, fx=["kenburns", "glow"]), beats=2, tr="cut"),   # stones, tweezers (< 3.5 s)
        dict(shot=b(1620314, 3.6, fx=["punch"]), beats=2, tr="cut"),              # Rayane
        dict(shot=b(1621466, 0.6, fx=["kenburns", "glow"]), beats=2, tr="cut"),   # ring
        dict(shot=b(1631638, 0.5, fx=["kenburns"]), beats=3, tr="cut"),           # Rayane, slow motion
    ]
    texts = [
        dict(html=pill(["J'ai créé plus de 500 bagues.", "Voici ce que mes clients", "en disent :"], top=300), at=0, until=3),
        dict(html=cap("«&nbsp;Je suis <span class='y'>absolument en amour</span> avec ma bague&nbsp;!&nbsp;»"), at=3, until=7),
        dict(html=cap("«&nbsp;Le résultat est <span class='y'>parfait</span>&nbsp;!&nbsp;»"), at=7, until=10),
        dict(html=cap("«&nbsp;Rayane, très <span class='y'>professionnel</span> et courtois.&nbsp;»"), at=10, until=14),
        dict(html=cap("Consultation gratuite.<br>Lien en bio.", top=1260), at=14, until=18),
    ]
    return dict(name="N01_avis_natif", music="738", shots=shots, texts=texts,
                end=dict(beats=0, overlay=True, layers={}))


REELS = {"N01_avis_natif": N01_avis_natif}

if __name__ == "__main__":
    for n in sys.argv[1:] or list(REELS):
        out, total, bpm, st = pro.build(REELS[n]())
        print(f"{n}: {total:.2f}s @ {bpm} BPM -> {out}", flush=True)
