# Rendu 3D des bagues — Beto Jewelry

Outils de rendu pour le configurateur (maquette privée : https://claude.ai/artifact/8kLqd2HMoxbWhUgH3pnE72).
Aucun coût, aucune marge et aucun fichier CAO de Rayane dans ce dossier (dépôt public) :
les modèles `models/*.json` restent dans l'artefact privé, les coûts dans Supabase `pricing_config`.

## 1. Tailles de pierres exactes — `blender/gems.py`, `blender/brilliant.py`
Chaque pierre est un polyèdre à facettes planes calculé par intersection de demi-espaces :
- taille brillant (57 facettes + rondiste) : rond, ovale, coussin, poire, marquise ;
  table 56 %, couronne 34°, pavillon 40,8°, profondeur ≈ 60 % ;
- princesse et radiant : brillant sur contour carré/rectangulaire avec facettes en chevron ;
- émeraude : taille à degrés (3 gradins de couronne, 3 de pavillon).
`python gems.py gems.json` écrit les 8 formes (utilisées par la visionneuse).

## 2. Studio photo Blender (Cycles) — `blender/scene.py`
- Jonc reconstruit par révolution du profil mesuré sur le modèle de Rayane (parfaitement lisse) ;
  version pavé avec dessus plat et sièges percés (booléen « auto-intersection » activé).
- Pavé : pierres de 1,4 mm, grains partagés, de 76,5° à −6° de chaque côté (semi-éternité).
- Diamant : verre d'indice 2,417 ; option `--fire` = 3 rendus R/V/B (2,407 / 2,419 / 2,451) recombinés.
- Éclairage : boîtes à lumière, bandes, points vifs ; cartes noires et fond sombre **vus seulement à
  travers les pierres** (contraste des facettes sans assombrir le métal) ; ombre de contact sur fond blanc.
- Leçon apprise : le réalisme d'un diamant vient de l'environnement qu'il reflète ; un sol ou un fond
  clair vu à travers la pierre la rend laiteuse.

## 3. Visionneuse temps réel — `visionneuse/beto-viewer.js`
Diamants calculés dans le navigateur (lancer de rayons dans la pierre via three-mesh-bvh, d'après
MeshRefractionMaterial de pmndrs/drei, MIT), Fresnel réel, dispersion en trois couleurs, studio qui suit
la caméra (anneau lumineux autour de l'objectif, tente de panneaux). Mode `solo=1` : une pierre seule
sur fond transparent — sert à produire les vignettes du sélecteur (`stones_rt.sh`).
Test local : `python3 -m http.server` dans le dossier, puis `node shot.js "pave=1" sortie.png 700`
(les modules three/three-mesh-bvh sont servis depuis node_modules).

## 4. Ajouter un style à partir d'une photo — `configurateur/styles-extra.js`
1. Identifier les briques sur la photo : tête (4 griffes, 6 griffes, halo caché, serti clos), jonc
   (largeur, fendu, torsadé), pavé (demi, ¾), halo, cathédrale, pierres de côté (rond, poire, émeraude),
   toi et moi, orientation est-ouest.
2. Ajouter une ligne `add(id, nom, description, étiquette, grammes14K, kit, petites pierres, conf)`.
3. Générer les 4 vignettes 400 × 400 (`img/thumbs/<id>_<blanc|jaune|rose|platine>.jpg`) avec le script
   de capture du configurateur, vérifier qu'il n'y a aucune erreur, publier l'artefact.
4. Règle : seulement des designs génériques du métier, jamais la copie d'un modèle signature d'une autre
   maison ; le nom et la description sont les nôtres.

## 5. Alliances assorties (prix)
Nombre de pierres = pierres qui tiennent sur l'arc couvert (semi = moitié supérieure, ¾, complète) au rayon
du jonc pour la taille de doigt ; diamètre = min(1,95 mm, 95 % de la largeur du jonc) ;
poids de métal = volume du jonc (−12 % pour les sièges) × densité ; coûts et marge lus dans `pricing_config`
(`alliance.profit`, calibré sur une vente réelle — à confirmer par Rayane).

## 6. Rendus photoréalistes des fichiers MatrixGold — `blender/scene_3dm.py`
Les fichiers .3dm de Rayane restent hors du dépôt (`BETO_3DM_DIR`). Étapes d'un rendu :
1. `load3dm.py` lit le métal (calques Metal, Object::Setting, Extra) et les pierres (blocs MatrixGold), écarte la bibliothèque
   de pierres posée à côté ; `--layers` force les calques d'un fichier mal rangé (ex. jonc sur « Render::Ground Plane »).
2. `finish.py` finit la pièce préparée pour le sertissage : griffes rabattues et coupées au-dessus de la couronne, bouts
   arrondis, et **aucun métal dans la pierre** (ramené à sa surface) — le métal qui traversait la pierre la rendait laiteuse.
3. `reshape.py` (`--shape ovale --ct 2`) adapte une tête à une autre forme : métal déformé selon le contour de la nouvelle
   pierre, profondeur du pavillon suivie, halo caché déplacé avec la tête ; dimensions selon le carat (usage du métier).
   Griffes placées comme le veut le métier : coins pour princesse, émeraude, radiant, coussin ; marquise à 6 griffes et
   poire à 5 griffes (griffe de pointe copiée d'une vraie griffe de la tête) ; petites pierres qui se chevauchent retirées.
4. Rendu Cycles : studio HDRI pour le métal, tente de lumière et boîte derrière l'objectif vues seulement par le métal ;
   passe séparée des pierres (studio du diamant irrégulier, fond sombre) ; masque des pierres.
5. `gempost.py` : retouche des pierres seulement, courbe tonale de référence (fichier `tone_ref.npy`, hors dépôt),
   pierre centrale et petites pierres traitées à part ; `repost.py` refait la retouche sans relancer le rendu.
Cadrage automatique par vue (silhouette projetée, 80 % de l'image). `--turntable 36` : 360° (la bague tourne, studio fixe).
`batch_prod.sh` : réglages de production (5 vues, or jaune / blanc / platine).
