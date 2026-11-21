"""Finishing kit for every reel and ad (Rayane, 21 Nov 2026: « optimise la création de contenu… et les recherches web »).

One command turns a rendered reel into everything a post needs, in pro/pack/<name>/:
  <name>_9x16.mp4   the master (copied)
  <name>_4x5.mp4    the feed version (crop 1080x1350 from y 200), made if missing
  <name>_cover.jpg  cover: the sparkliest frame of a chosen window + the title, kept inside the centre 3:4 crop
                    (1080x1440, what the profile grid shows), in the site fonts
  caption.txt       the description to paste (search words in the first line, the sheet, the call to action,
                    5 hashtags at most), the alt text, and where to put it in the app

Why: Instagram and Google read the words of a post (description, alt text, text on screen), not the image, to know
what it is about; public professional accounts' posts can appear in Google. So the first line is the exact search,
French first then English (Montréal, Google Ads volumes Nov 2025 to Oct 2026: « engagement ring montreal » about 590 a
month, « bague de fiançailles » about 1 300; « bague sur mesure Montréal » is too rare to measure: DONNEES.md §32).
Facts only from FAITS.md and the piece sheets; prices only those Rayane gave; « diamant de laboratoire » always spelled
out next to « diamant ». Usage: pack.py NAME [NAME ...]  (names are keys of POSTS)."""
import json, os, shutil, subprocess, sys
import numpy as np
import reelkit as rk

PRO = f"{rk.E}/pro"
CTA_FR = "Consultation gratuite (1 h), en personne à Montréal ou en vidéo : lien en bio."

# cover: (clip, t0, t1, title): a CLEAN master (never the finished reel, its captions are burned in), the window to
# search for the sparkliest frame, and the title (HTML, lux classes from layers2.js)
POSTS = {
    "R_laquelle": dict(
        cover=("QUATRE66", 0.2, 5.5, '<div class="lx lxo" style="top:330px">Marquises sur mesure</div>'
                          '<div class="lx lxh" style="top:380px;font-size:88px">Laquelle <i>tu choisis ?</i></div>'),
        caption=["Bague de fiançailles marquise sur mesure à Montréal · Engagement ring, Montreal",
                 "Laquelle tu choisis : 1, 2 ou 3 ?",
                 "Écris ton chiffre en commentaire.",
                 "",
                 "1 · Marquise, or blanc, anneau torsadé",
                 "2 · Marquise, or jaune, tête florale",
                 "3 · Marquise, or jaune, avec son jonc pavé",
                 "",
                 "Chaque bague est dessinée sur mesure par Rayane, joaillier diplômé à Montréal. Design 3D en 48 h.",
                 CTA_FR],
        tags=["#baguedefiancailles", "#montreal", "#surmesure", "#marquise", "#joaillerie"],
        alt="Trois bagues de fiançailles marquise sur un plateau noir : une en or blanc à l'anneau torsadé, "
            "une en or jaune à tête florale, une en or jaune avec un jonc pavé assorti."),
    "AD_multi_2bagues": dict(
        cover=("JOBBY3W", 18.0, 24.0, '<div class="lx lxo" style="top:330px">Sur mesure à Montréal</div>'
                         '<div class="lx lxh" style="top:380px;font-size:84px">Nos vrais <i>prix.</i></div>'),
        caption=["Bague de fiançailles sur mesure à Montréal · Engagement ring, Montreal",
                 "Nos dernières bagues, avec leur vrai prix.",
                 "",
                 "Marquise 2 carats, diamant de laboratoire E VVS2, certificat IGI, or blanc 14k, griffes serties "
                 "de diamants : 2 600 $ + taxes.",
                 "Marquise 4 carats, diamant de laboratoire E VVS2, certificat IGI, or jaune 14k, tête florale et "
                 "halo caché : 3 350 $ + taxes.",
                 "",
                 "Design 3D en 48 h, bague prête en 2 semaines. Commence ton design (dépôt de 250 $ + taxes, crédité "
                 "à 100 %) ou réserve une consultation gratuite."],
        tags=[],
        alt="Deux bagues de fiançailles marquise en diamant de laboratoire, l'une en or blanc, l'autre en or "
            "jaune, avec leur prix."),
    "AD_benny_15": dict(
        cover=("BENNY42W", 0.5, 6.0, '<div class="lx lxo" style="top:330px">Marquise · 2 carats</div>'
                         '<div class="lx lxh" style="top:380px;font-size:84px">Griffes <i>serties.</i></div>'),
        caption=["Bague de fiançailles marquise 2 carats, diamant de laboratoire · Engagement ring, Montreal",
                 "Sur mesure à Montréal : 2 600 $ + taxes.",
                 "Diamant de laboratoire E VVS2, certificat IGI, or blanc 14k, anneau torsadé serti, halo caché, "
                 "et des diamants de laboratoire jusque sur les griffes.",
                 "La même, faite pour toi, ou une version à toi. Design 3D en 48 h."],
        tags=[],
        alt="Bague de fiançailles marquise en diamant de laboratoire, or blanc, anneau torsadé serti de petits "
            "diamants."),
    "AD_jobby_15": dict(
        cover=("JOBBY3W", 19.0, 24.0, '<div class="lx lxo" style="top:330px">Marquise · 4 carats</div>'
                         '<div class="lx lxh" style="top:380px;font-size:84px">Tête <i>florale.</i></div>'),
        caption=["Bague de fiançailles marquise 4 carats, diamant de laboratoire · Engagement ring, Montreal",
                 "Sur mesure à Montréal : 3 350 $ + taxes.",
                 "Diamant de laboratoire E VVS2, certificat IGI, or jaune 14k, tête florale, halo caché, accents "
                 "marquise sur l'anneau.",
                 "La même, faite pour toi, ou une version à toi. Design 3D en 48 h."],
        tags=[],
        alt="Bague de fiançailles marquise de 4 carats en diamant de laboratoire, or jaune, tête florale et "
            "petites marquises sur l'anneau."),
    "AD_multi_groupe": dict(
        cover=("QUATRE66", 0.2, 5.5, '<div class="lx lxo" style="top:330px">Sur mesure à Montréal</div>'
                         '<div class="lx lxh" style="top:380px;font-size:84px">Nos dernières <i>bagues.</i></div>'),
        caption=["Bague de fiançailles sur mesure à Montréal · Engagement ring, Montreal",
                 "Nos dernières bagues, faites à Montréal.",
                 "",
                 "Marquise 2 carats, diamant de laboratoire E VVS2, certificat IGI, or blanc 14k : 2 600 $ + taxes.",
                 "Marquise 4 carats, diamant de laboratoire E VVS2, certificat IGI, or jaune 14k : 3 350 $ + taxes.",
                 "",
                 "Commence ton design (dépôt de 250 $ + taxes, crédité à 100 %) ou réserve une consultation gratuite."],
        tags=[],
        alt="Quatre bagues sur un plateau noir : deux bagues de fiançailles marquise, une marquise en or jaune "
            "avec son jonc pavé, et un large jonc blanc serti sur le bord."),
}


def run(cmd):
    subprocess.run(cmd, check=True)


def sparkliest(path, t0, t1):
    """Time of the frame with the most near-white pixels (facets catching light) between t0 and t1."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t0), "-t", str(t1 - t0), "-i", path, "-vf",
                          "fps=12,scale=1080:1920,crop=1080:1100:0:450,scale=270:275,format=gray", "-f", "rawvideo",
                          "-"],
                         capture_output=True, check=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(-1, 275, 270)
    return t0 + int(np.argmax((f > 235).sum((1, 2)))) / 12


def cover(name, clip, t0, t1, title, out):
    src = f"{rk.E}/assets/{clip}.mp4"
    t = sparkliest(src, t0, t1)
    frame = f"{out}/_frame.png"
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", src, "-frames:v", "1", "-vf",
         "scale=1080:1920:flags=lanczos,unsharp=5:5:0.3:5:5:0", frame])
    d = rk.render_layers(f"cover_{name}", {"title": '<div class="lxs" style="height:760px"></div>' + title})
    run(["ffmpeg", "-v", "error", "-y", "-i", frame, "-i", f"{d}/title.png", "-filter_complex", "overlay=0:0",
         "-q:v", "2", f"{out}/{name}_cover.jpg"])
    os.remove(frame)
    return t


def pack(name):
    p = POSTS[name]
    src = f"{PRO}/{name}.mp4"
    out = f"{PRO}/pack/{name}"
    os.makedirs(out, exist_ok=True)
    shutil.copyfile(src, f"{out}/{name}_9x16.mp4")
    f45 = f"{PRO}/{name}_4x5.mp4"
    if not os.path.exists(f45):
        run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "crop=1080:1350:0:200", "-c:v", "libx264", "-preset",
             "slower", "-crf", "13", "-x264-params", "aq-mode=3:keyint=48:min-keyint=24", "-maxrate", "24M",
             "-bufsize", "48M", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
             "-colorspace", "bt709", "-c:a", "copy", "-movflags", "+faststart", f45])
    shutil.copyfile(f45, f"{out}/{name}_4x5.mp4")
    t = cover(name, *p["cover"], out)
    tags = p["tags"][:5]
    text = "\n".join(p["caption"]) + ("\n\n" + " ".join(tags) if tags else "")
    note = ("DESCRIPTION (à coller telle quelle)\n" + "-" * 40 + "\n" + text + "\n\n"
            "TEXTE ALTERNATIF (Paramètres avancés > Accessibilité > Écrire un texte alternatif)\n" + "-" * 40 + "\n"
            + p["alt"] + "\n\n"
            "COUVERTURE : " + f"{name}_cover.jpg (plan {p['cover'][0]} à {t:.1f} s, titre dans le cadre 3:4 de la grille)\n")
    open(f"{out}/caption.txt", "w").write(note)
    json.dump(dict(name=name, cover_t=round(t, 2), chars=len(text), hashtags=len(tags)),
              open(f"{out}/pack.json", "w"), ensure_ascii=False)
    print(f"{name}: pack ok (cover at {t:.1f} s, {len(text)} characters, {len(tags)} hashtags) -> {out}", flush=True)


if __name__ == "__main__":
    for n in sys.argv[1:]:
        pack(n)
