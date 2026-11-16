# Guide de tournage : ce que Rayane filme, ce que l'agent vidéo en fait

Mis en place le 12 nov. 2026, à partir de l'étude de marché (`DONNEES.md` §9). Le but est de faire beaucoup de contenu avec peu de temps de tournage. Un tournage de 15 minutes doit donner :
- 3 à 5 reels ;
- un carrousel ;
- les photos du site ;
- des variantes de pub.

## 1. Chaque matin : la banque du jour

La tâche programmée « Banque de vidéos à filmer — Beto Jewelry » envoie chaque jour à 7 h 18 une notification au téléphone de Rayane. Elle contient :
- 6 à 8 plans à filmer (moins de 20 minutes en tout) ;
- une phrase à dire face caméra ;
- les points à raconter dans un message vocal.

Le thème change chaque jour :

| Jour | Thème |
|---|---|
| Lundi | L'établi en POV |
| Mardi | Éducatif |
| Mercredi | Vitrine d'une pièce finie |
| Jeudi | Confiance, face caméra |
| Vendredi | Parcours client |
| Samedi | Montréal et émotion |
| Dimanche | Le paiement en 3 étapes et la date limite de la saison |

## 2. Pour chaque pièce finie (10 à 15 min, avant la remise)

**Réglages iPhone**
- 4K à 60 i/s.
- Ralenti à 240 i/s pour l'éclat.
- **Vidéo HDR désactivée** : sinon, voile blanc.
- Mise au point et exposition verrouillées par un appui long sur l'écran.
- Trépied.

**Lumière**
- Une fenêtre à 90°, avec un rideau voilé comme diffuseur.
- Une petite lampe DEL pour faire briller les pierres.

**Liste de plans**
1. Le tour complet de la bague, sur un plateau tournant près de la fenêtre (15 s).
2. Le gros plan des griffes et du profil (10 s).
3. Le ralenti de la bague qui tourne entre les doigts (10 s).
4. La bague portée **à l'annulaire, jamais à l'auriculaire**, et jamais sur un doigt du gant noir (10 s).
5. L'ouverture de l'écrin, au ralenti (8 s).
6. Deux photos à plat sur fond neutre, de face et de profil (pour le site et les carrousels).
7. Le rendu CAD de la même bague, en capture d'écran ou en animation MatrixGold.
8. La réaction du client à la remise, **seulement avec son accord écrit**.

**À ne jamais filmer**
- Le reflet de Rayane dans une vitre.
- Un écran qui montre le site ou le produit d'une autre marque.
- Un numéro de certificat IGI lisible.
- La gravure personnelle d'un client.

## 3. Ta voix

L'étude montre que les comptes de bijoutiers qui racontent (la voix du fondateur sur des images de l'atelier) ont beaucoup plus de vues que les vitrines muettes. La voix rassure aussi, et la confiance est ce qui fait réserver.

**Message vocal (30 à 45 s)**
- Enregistré avec l'app Dictaphone ou WhatsApp, dans une pièce calme.
- Raconte avec tes mots : ce que tu fais aujourd'hui, pour qui (sans nom), pourquoi c'est spécial.
- Pas besoin de texte lu : un seul essai suffit, je coupe les hésitations.

**Face caméra (15 s, une prise)**
- Une question en accroche (« Tu sais pourquoi on appelle ça un sertissage cathédrale ? »), puis la réponse en une phrase.

L'agent monte la voix sur tes plans, ajoute les sous-titres en français et la musique dessous. Instagram peut doubler la vidéo en anglais automatiquement (traductions Meta AI, à activer dans l'app).

**Bon dosage par semaine**
- 2 à 3 face caméra ;
- 3 à 4 messages vocaux ;
- les plans de l'établi tous les jours.

## 4. Comment m'envoyer les fichiers

- Dans le chat Claude, ou dans le dossier Google Drive « Beto — Banque contenu » (à créer).
- Les vidéos **originales** : jamais une capture d'écran ni une vidéo déjà publiée avec un filigrane.
- Dis-moi en une ligne de quelle pièce il s'agit (forme, métal, pierre). Je n'invente rien sur une pièce.

## 5. Ce que l'agent en fait (automatique)

**Retouche des photos**
- Détourage de la bague (`cutout.py`, modèle BiRefNet).
- Fond aux couleurs de la marque, reflet et ombre douce.
- La bague elle-même n'est jamais modifiée.

**Reels**
- Accroche dans la première seconde, puis une montée (3 ou 4 raisons, étapes ou détails), puis l'appel à l'action « Consultation gratuite — lien en bio ».
- Motion design : typo géante, texte qui passe derrière la bague, compteurs, explicatifs.
- Musique Mixkit dans le fichier. Une version `_APP` sans musique, coupée au tempo d'une chanson à la une, que Rayane publie dans l'app avec la chanson.

**Formats**

| Format | Part |
|---|---|
| Histoire d'atelier avec ta voix | 35 % |
| Vitrine produit | 20 % |
| Face caméra | 15 % |
| Éducatif | 15 % |
| Parcours client | 10 % |
| Paiement en 3 étapes | 5 % |

**Banque d'images (Mixkit)**
- Seulement des gens et de l'émotion (demandes en mariage, mariages, hiver), en noir et blanc, comme ingrédient.
- Jamais le sujet principal ni une bague en gros plan.
- Jamais présentée comme Montréal ou comme nos clients.

**Ailleurs**
- Les mêmes plans servent aux photos du site, aux carrousels et aux pubs. Les changements de pub ou de budget sont seulement proposés à Rayane.

## 6. Ce qui reste à Rayane

- Publier les versions `_APP` avec la chanson à la une (environ 1 minute par reel dans l'app).
- Donner les modalités exactes des plans de paiement avant toute vidéo qui en parle (voir `DONNEES.md` §9 pour les règles du Québec).

## 7. Les deux installations de tournage (16 nov. 2026)

Décision de Rayane du 16 nov. 2026 : le contenu passe avant la formation en sertissage (voir `docs/business-ops-brief.md` §8quinquies). Rayane filme ; l'agent vidéo et l'équipe marketing font le montage. Deux installations fixes, à monter en 2 minutes grâce à des marques au sol (ruban adhésif sous le trépied, la chaise et les pieds des lampes).

Matériel déjà en main : iPhone, trépied JOILCAN 68″ avec télécommande Bluetooth, micro DJI Mic Mini 2.

Réglages iPhone communs :
- Réglages > Appareil photo > Enregistrement vidéo : 4K. **Vidéo HDR désactivée** (sinon, voile blanc).
- Toutes les lumières à la même température. Plafonnier éteint, jamais une fenêtre dans le dos.
- Mise au point et exposition verrouillées (appui long sur l'écran). L'app gratuite Blackmagic Camera permet aussi de bloquer la balance des blancs.
- Une prise test de 5 secondes avant de commencer : cadrage, son, reflets.

### 7.1 Face caméra (vidéos explicatives)

Placement :
- Téléphone **à hauteur des yeux**, en vertical, objectif **2x** (visage plus naturel qu'en 1x), à environ 1 à 1,5 m.
- Lumière principale : une boîte à lumière (softbox) à 45° d'un côté, un peu au-dessus des yeux, à environ 1 m du visage.
- Deuxième boîte de l'autre côté, beaucoup plus faible, ou un mur blanc pour déboucher les ombres.
- Fond : l'établi ou l'atelier, à 1,5 à 2 m derrière Rayane, avec une petite lampe chaude allumée pour la profondeur.
- Micro pincé à 15 à 20 cm sous le menton, réduction de bruit activée.

Pendant la prise :
- Regarder l'objectif, pas l'écran.
- Pas de texte lu. Une carte avec 3 mots-clés, collée juste sous le téléphone.
- Structure : une question en accroche, 2 ou 3 points, puis une phrase de fin (« Réserve ta consultation gratuite, le lien est dans ma bio »).
- 15 à 45 secondes. Une prise ratée, on recommence depuis l'accroche.

### 7.2 Bagues finies (le plateau « vitrine »)

Placement :
- La bague sur un plateau tournant motorisé, vitesse lente, tenue par une cire de musée transparente.
- Fond noir brillant (plexiglas noir) pour les reels ; carton mat couleur sable, proche du fond des photos du site, pour les photos du site.
- Une boîte à lumière au-dessus et un peu derrière la bague : grand reflet doux sur le métal.
- Une ou deux **petites lumières dures** (point lumineux, sans diffuseur) sur le côté et derrière, à la hauteur de la pierre : ce sont elles qui font briller les facettes quand la bague tourne.
- Des cartons noirs sur les côtés : lignes sombres dans le métal, pour que l'or ait l'air d'or et non d'un blanc plat.
- Un grand carton noir percé d'un trou pour l'objectif, devant la bague : il cache le téléphone et Rayane dans les reflets.
- Téléphone sur trépied, à la hauteur de la pierre ou un peu au-dessus, en mode macro (iPhone Pro depuis le 13 Pro, et iPhone depuis le 16) ou avec un objectif macro.

Réglages et règles :
- Balance des blancs bloquée en lumière du jour (environ 5600 K). La teinte des pierres de couleur (rose, jaune, bleu, vert) ne doit jamais changer.
- Exposition un peu sous la normale, pour que les éclats ne deviennent pas des taches blanches.
- Nettoyer la bague (chiffon microfibre, poire à air) juste avant : la macro montre chaque trace de doigt.
- Manipuler avec des gants de coton, mais **jamais une bague enfilée sur un doigt de gant**, et **jamais à l'auriculaire** (règle de Rayane). Bague portée : seulement à l'annulaire.
- Les plans à faire sont ceux du §2.

### 7.3 Matériel recommandé (prix vus le 16 nov. 2026, avant taxes, à revérifier)

| Étape | Matériel | Prix indicatif | Sert à |
|---|---|---|---|
| 1 | NEEWER NK103 : 2 boîtes à lumière 60 × 60 cm, ampoules bicolores IRC 95, pieds, télécommande | 119,99 $ en solde (171,99 $ régulier), ca.neewer.com | les deux installations |
| 1 | 2 petites lampes Ulanzi VL49 (5500 K) | 33 $ chacune, boutique canadienne Ulanzi | les éclats des pierres |
| 1 | Plateau tournant motorisé, vitesse réglable | 38 à 60 $ | les tours de bague |
| 1 | Plexiglas noir, carton sable, cartons noirs et blancs, cire de musée | quelques dizaines de dollars (DeSerres, quincaillerie) | fonds et reflets |
| 2 | Amaran 100d S, utilisée sans diffuseur comme point lumineux puissant | 189 $ (Vistek) | éclats plus nets, ralenti à 240 i/s |
| 3 | **Sony a6700** (boîtier), piste proposée par Rayane le 16 nov. 2026 | environ 1 800 $ (Aden Camera) | stabilisation intégrée, viseur, 4K à 120 i/s, S-Cinetone et S-Log3 en 10 bits |
| 3 | Objectif Sigma 18-50 mm f/2.8 DC DN (monture Sony E) | 730 à 830 $ (AVShop.ca, Aden Camera) | face caméra et atelier |
| 3 | Objectif Sigma 70 mm f/2.8 DG DN Macro Art (monture Sony E) | environ 706 $ (Kamerastore) | gros plans de griffes et de pierres |

Notes :
- Moins cher que l'a6700 : la Sony ZV-E10 II (1 399,99 $ sur sony.ca), sans stabilisation intégrée, sans viseur et limitée à 4K à 60 i/s.
- L'objectif Sony E 30 mm Macro (349,99 $) coûte moins cher, mais il faut être à 2 ou 3 cm de la bague : l'objectif bloque la lumière. Le 70 mm laisse de la place pour éclairer.
- GemLightbox (boîte de photo pour bijoutiers, environ 900 à 3 700 $ US) : simple, mais donne un look catalogue sur fond blanc. Le plateau ci-dessus coûte beaucoup moins cher et donne le look sombre et cinéma de la marque.
- Téléprompteur : pas au début (le texte lu sonne faux). Si un jour : le NEEWER X12 fonctionne avec l'iPhone seulement en objectif 2x (focale de plus de 28 mm).
- Payé par la société : dépense d'entreprise, taxes récupérables. Garder tous les reçus (voir le skill `beto-comptabilite`).

### 7.4 Devenir pro : de l'iPhone à la Sony a6700 (demandé par Rayane le 16 nov. 2026)

Ce qui rend une vidéo « cinéma » : la lumière, le cadrage, des mouvements lents et une couleur constante d'une vidéo à l'autre. Le Log ne fait pas ça tout seul : il donne seulement plus de marge pour travailler la couleur après coup.

**Étape 1 : iPhone + Blackmagic Camera (gratuit), 4 semaines, une compétence par semaine**
1. **Exposition.** 24 ou 30 i/s ; vitesse d'obturation au double (1/50 s à 24 i/s, 1/60 s à 30 i/s) ; ISO au plus bas ; zébras ou fausses couleurs pour ne jamais brûler les éclats ; balance des blancs fixée en kelvins.
2. **Lumière.** Lumière principale, débouchage, contre-jour. « Négatif » : un carton noir du côté sombre du visage pour plus de relief.
3. **Mouvement.** Mouvements lents et réguliers (plateau tournant, travelling), premier plan dans le cadre, règle des tiers, repères de cadrage 9:16 de l'app.
4. **Couleur.** Le même rendu sur toutes les vidéos. Apple Log seulement sur un iPhone 15 Pro ou plus récent, avec la LUT officielle d'Apple ; comparer avec le mode normal avant de l'adopter.

**Étape 2 : Sony a6700, quand les 4 semaines sont faites et que la demi-journée de tournage hebdomadaire tient**
- Commencer en **S-Cinetone** : un rendu cinéma directement à la sortie de la caméra, sans étalonnage.
- Passer au **S-Log3** une fois la lumière maîtrisée. Exposer un peu au-dessus de la normale (sinon, du bruit), et toujours appliquer une LUT. Sur l'a6700, la LUT importée sert seulement à prévisualiser : elle n'est pas gravée dans la vidéo, le montage l'applique.
- Bagues : vérifier, sur chaque vidéo en Log, que la couleur des pierres est la même que dans la réalité (règle : la teinte des pierres ne change jamais).

**Côté montage (agent vidéo)**
- Le moteur de montage convertit aujourd'hui la vidéo HDR (HLG) de l'iPhone. **Il ne lit pas encore le Log** : la conversion avec la LUT officielle (Apple Log ou S-Log3) est à ajouter avant le premier tournage en Log, sinon l'image sort grise et délavée.
- Les fichiers Log (surtout ProRes) sont très lourds : prévoir l'espace de stockage (Google Drive plein le 16 nov. 2026).
