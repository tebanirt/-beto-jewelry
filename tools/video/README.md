# Studio vidéo Beto Jewelry (reels et trial reels)

Moteur de montage automatique : ffmpeg + Chromium (Playwright) pour les textes + son synthétisé, donc libre de droits. Il fait des reels 1080×1920 à 30 i/s, à −14 LUFS, avec :
- les polices du site (Bodoni Moda, Jost) ;
- le vrai logo (`tools/invoicing/assets/logo.png`, jamais modifié) ;
- l'étalonnage « Beto Lux v2 ».

Règles de contenu et autorisations : voir `docs/business-ops-brief.md` §10.

## Fichiers

| Fichier | Rôle |
|---|---|
| `reelkit.py` | Moteur : plans (étalonnage, recadrage 9:16, effets), grille 2×2, textes, assemblage, son |
| `sfx.py` | Sound design synthétisé : bases `lux`, `velocity`, `ambient`, `edu`, plus whoosh, impact, scintillement, tick |
| `layers2.js` | Cartes de texte (PNG transparents) aux couleurs de la marque |
| `reels.py` | Lot 1 : 10 reels sur les diamants de labo de couleur (R01 à R10) |
| `reels_b.py` | Lot 2 : 10 reels faits avec le B-roll de la consultation (B01 à B10) |
| `reels_c.py` | Lot 3 : making-of de la bague marquise, du rendu 3D à la fonte (C01 à C05) |
| `reels_d.py` à `reels_i.py` | Lots 4 à 9 (rendus contre vraies bagues, votes, Mont-Tremblant, Noël, etc.) |
| `beats.py` | Analyse de la musique : tempo, temps, premiers temps de mesure, passage le plus énergique |
| `pro.py` | Montage « pro » : vraie musique, coupes sur le temps, transitions, texte mot par mot, scintillements |
| `reels_pro.py` | Premier reel pro validé par Rayane le 10 nov. 2026 (P02, 4 couleurs) |
| `reels_pro2.py` | Vague 11 : concepts des lots 1 à 9 refaits en montage pro (P04 à P07, P10, P11) |
| `reels_pro3.py` | Vague 11 : Noël FR et EN, du rendu à l'or en anglais, designs 3D, sans bague portée au doigt |
| `review.sh` | Planche de contrôle (`NOM fps colonnes`) + loudness |
| `put_upload.sh` | Envoie un mp4 vers l'URL signée Supermetrics (`create_upload_url`) |
| `make_assets.sh` | Recrée les fichiers dérivés : gravure IGI floutée, rendu du lotus recadré |

## Installation (nouvelle session)

```bash
export BETO_WORK_DIR=/tmp/beto-video
mkdir -p $BETO_WORK_DIR/{footage,broll,fonts_pkg}
(cd $BETO_WORK_DIR/fonts_pkg && npm pack @fontsource/bodoni-moda @fontsource/jost --silent \
  && for t in *.tgz; do tar xzf $t && mv package ${t%.tgz}; done)
python3 -m venv $BETO_WORK_DIR/venv && $BETO_WORK_DIR/venv/bin/pip install -q numpy scipy
export BETO_PY=$BETO_WORK_DIR/venv/bin/python
export BETO_MUSIC_DIR=$BETO_WORK_DIR/music
```

**Musique (montage pro)** : des pistes Mixkit, enregistrées sous leur numéro (`470.mp3`). L'hôte `assets.mixkit.co` est autorisé dans l'environnement « -beto-jewelry ».

```bash
mkdir -p $BETO_MUSIC_DIR
for id in 470 399 866; do curl -sSL -o $BETO_MUSIC_DIR/$id.mp3 https://assets.mixkit.co/music/$id/$id.mp3; done
```

Licence Mixkit (Stock Music Free License) : usage commercial permis sur les réseaux sociaux, sans mention obligatoire. Interdit : redistribuer la musique seule (jamais de mp3 dans ce dépôt), l'enregistrer dans un service de droits (Content ID) ou la présenter comme la nôtre.

**Vidéos brutes** : téléchargées depuis Google Drive (l'hôte `drive.usercontent.google.com` est autorisé dans l'environnement « -beto-jewelry ») :

```bash
curl -sSL -o "$BETO_WORK_DIR/broll/<titre>.mov" "https://drive.usercontent.google.com/download?id=<fileId>&export=download&confirm=t"
```

Le connecteur Google Drive (`search_files` avec `parentId = '<dossier>'`) donne la liste des `fileId`.
- **B-roll de la consultation** : dossier « Frame » `1w-XwO_5-ELvI2BD7lWnYFFrcDo9zTJsX` (fichiers `FrameXXXXXXXX.mov`), dans `$BETO_WORK_DIR/broll`.
- **Clips iPhone HDR** (`IMG_xxxx.mov`), **rendus** (`*.jpg`) et **animations CAD** (`*.mp4`) : dans `$BETO_WORK_DIR/footage`. Le moteur trouve un fichier par la fin de son nom (`u:<fichier>` pour une vidéo, `img:<fichier>` pour une image fixe).

## Rendre

```bash
cd tools/video
python3 reels.py R01_blanc_ou_rose      # ou sans argument : tout le lot
python3 reels_b.py                      # lot 2
./review.sh R01_blanc_ou_rose 5 9       # vérifier image par image avant de publier
$BETO_PY reels_pro.py P02_couleurs_velocity   # montage pro (numpy + scipy) -> $BETO_WORK_DIR/pro
```

**Montage pro** (`pro.py`) : chaque reel donne une piste (`music`), des plans comptés en temps (`beats`) avec une transition (`zoomin`, `hblur`, `fadewhite`, `smoothleft`, `fade` ou `cut`), des textes (`card_words`, un mot à la fois) et une carte de fin. Le moteur trouve le tempo, commence au passage le plus fort de la chanson, place chaque coupe sur un temps, ajoute une légère lueur (`glow`) et des scintillements, puis mixe la musique et les effets à −14 LUFS.

Avant toute publication, vérifier chaque reel :
- le texte est dans la zone sûre (ni dans le haut 14 %, ni dans le bas 35 %) ;
- aucun reflet de Rayane dans la vitre ;
- aucune image vide ou figée ;
- la loudness est autour de −14 LUFS.

## Publier en trial reel (Supermetrics, compte IG 17841453213405228)

1. `creative_picker` → `action: create_upload_url`, `ds_id: IGI`, `params: {content_type: "video/mp4", filename, size}`.
2. `./put_upload.sh <fichier.mp4> "<upload_url>"` doit répondre HTTP 200.
3. `manage_social_media` → `action: publish`, avec :
   - `content_type: VIDEO`, `upload_ref`, `caption` (5 hashtags max) ;
   - `platform_options: {trial_reel: {graduation_strategy: "SS_PERFORMANCE"}, thumb_offset: 0}` ;
   - `publish_at` et `timezone: America/Toronto`.
   Espacer les publications d'au moins 60 minutes, et en faire 3 à 5 par jour au maximum.
4. Noter chaque publication dans Supabase `public.social_reels` (statut, heure, `ig_media_id`).
5. Après 72 h : relever le taux de saut, le temps regardé, les vues, les partages et les abonnements (`instagram_insights`, ds_id IGI, rapport `AccountMediaVideo`), puis mettre à jour `metrics` et `score`.

Si `manage_social_media` répond `SCOPE_UPGRADE_REQUIRED`, Rayane doit reconnecter Instagram dans Supermetrics avec la permission de publier. Ne pas réessayer en boucle.
