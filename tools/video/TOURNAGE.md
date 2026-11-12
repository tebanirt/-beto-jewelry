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
