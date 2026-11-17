# Étalonnage pro avec des outils gratuits (17 nov. 2026)

Chaîne de couleur pour les vidéos de bagues filmées en Apple Log 2. Elle a été construite après que Rayane a refusé la v10 : trop sombre, avec un effet noir et blanc, et un or et un diamant qui ne paraissaient pas réalistes.

## Outils (gratuits, sources officielles)
- **OpenColorIO 2.6** (licence BSD), avec la configuration officielle ACES 2.1 « studio-config-v5.0.0 ».
  - Elle contient la vraie transformation d'entrée **Apple Log 2**, gamme Apple Wide Gamut comprise.
  - C'est le système de couleur des studios de cinéma, le même que le mode ACES de DaVinci.
- **colour-science** (licence BSD) et numpy, pour les mesures.
- **ffmpeg**, pour les couches spatiales (masques, halo, grain).
- Installation : `pip install opencolorio colour-science scipy pillow`.

## Les couches, dans l'ordre d'un arbre de nœuds DaVinci
1. **Entrée** : Apple Log 2 vers ACEScct, avec la transformation officielle d'OpenColorIO.
2. **Équilibre et exposition** :
   - balance neutre sur le plateau gris (gains mesurés en ACEScg : 0,768 / 1 / 1,78) ;
   - exposition en diaphragmes, contraste autour du gris à 18 % ;
   - saturation.
3. **Sortie** : vue ACES 2.0 SDR (Rec.709, gamma 2.2 pour les téléphones). Les hautes lumières sont adoucies sans changer de teinte.
4. **Secondaires**, en OkLCh, sur l'image de sortie :
   - **Fond** : le plastique gris, sans couleur, est foncé séparément, sans toucher l'or.
   - **Or** : sélectionné par sa teinte (66° mesurés, cuivré), puis ramené vers le jaune paille du 14k, avec plus de couleur.
   - **Reflets polis** : ils gardent une teinte d'or pâle au lieu de virer à l'argent.
5. **Pierre et lumière**, dans ffmpeg :
   - **Pierre** : dans le masque qui suit la pierre (`stone_mask.py`), on retire seulement la teinte de fond. Les éclats colorés (le feu) restent.
   - **Fond** : retrait des petits points du plastique (option `despeckle`), vignettage.
   - **Éclats** : halo léger ou halation de film, puis grain fin.

## Les cibles (recherche du 17 nov., voir `../DONNEES.md` §20)
- **Or 14k**, mesuré sur les fiches techniques des alliages :
  - CIELAB a* de +2 à +3, b* de 18 à 19, teinte h de 81 à 84° ;
  - dans les reflets profonds, h de 71 à 76° ;
  - jamais de a* négatif : l'or vire au citron.
- **Diamant** : corps neutre, feu intact.
- **Fond**, au choix :
  - noir mat de 0 à 5 % (Graff, Harry Winston) ;
  - charbon en dégradé, de 10 à 13 % (De Beers, Cartier) ;
  - naturel.

## Les 5 looks (`looks.py`)
Mesures faites sur l'image de face, à 5,4 s.

| Look | Fond | Or | Lumière et texture |
|---|---|---|---|
| A, Noir atelier | 4 % | CIELAB h 80°, a* +3,5 | halo minime, grain 0,4 % |
| B, Charbon velours | environ 13 % au centre, vignettage | comme A | halo léger, grain 0,7 % |
| C, Or chaud | 9 %, chaud | h 77°, C* 30 | halo plus marqué |
| D, Film de campagne | noirs relevés de 5,5 % | h environ 80°, moins saturé | halation rouge-orangé, grain 1,2 % |
| E, Naturel | environ 14 % | h 81°, C* 18 | rien d'ajouté |

## Utilisation
```
python build.py A_noir test 5.4 9.6 15.0     # 3 images de contrôle
python build.py A_noir                       # master 4K (28 premières secondes)
C015_CLIP=u:C015_A_noir.mp4 C015_SUFFIX=_A_noir REEL_FPS=24 python ../reels_c015.py V2_ovale_or_jaune
```
Le masque de la pierre se fabrique avec `stone_mask.py` (voir `../enc_applelog2.sh`). `C015_DIR` indique le dossier qui contient `C015.mov` et `mask_c015.mkv`.
