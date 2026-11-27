# Règles du contenu Instagram — Beto Jewelry

Version 1 du 27 nov. 2026, écrite à la demande de Rayane : « fais une étude complète de pourquoi on ne dépasse jamais les 200 vues… fais-toi des règles claires… sois toujours très strict sur la qualité… amélioration constante automatique ».

Ce fichier passe avant tout autre réglage de la production quotidienne. `DONNEES.md` garde l'historique et les chiffres. Ici, il n'y a que les règles en vigueur.

## 1. Diagnostic (16 nov. au 26 nov. 2026)

- **Les chiffres** : 60 reels d'essai publiés en 16 jours. Le meilleur a fait 165 vues ; la moitié des reels font moins de 29 vues. En tout : 2 partages et aucun abonnement venu d'un reel. Dans les 3 premières secondes, 60 à 98 % des gens passent leur chemin. Le temps moyen regardé est de 1 à 5 s, pour des reels de 9 à 31 s.
- **Ce que veulent dire 100 à 200 vues** : c'est la taille du premier petit public test qu'Instagram donne à un reel d'essai. Aucun de nos reels n'a réussi ce test : les gens passent trop vite, personne ne l'envoie à quelqu'un, donc Instagram ne le montre à personne d'autre.
- **Les 6 causes** (de la plus grave à la moins grave) :
  1. **Aucune personne à l'écran.** Presque tous nos reels montrent une bague seule sur fond noir. Ces reels perdent 80 à 98 % des gens dès le début (T1 à T5, B1 à B3, M02, S5). Ceux qui retiennent le mieux ont une idée qui concerne la personne : un mythe démonté (W05 : 49,6 % de saut, W06 : 55,4 %), un prix avec sa fiche (C_princesse : 49,2 %), un avis lu mot pour mot (T06 : 53,6 %).
  2. **Aucune raison de partager.** Rien dans nos reels ne donne envie de l'envoyer à quelqu'un : pas de question à trancher, pas de conflit, pas d'info surprenante. Or, pour Instagram, les envois en message privé sont le signal le plus fort pour montrer un reel à des non-abonnés.
  3. **La même séance partout.** Une seule bague (la marquise de Jobby) dans 10 reels, et les mêmes 41 plans dans des dizaines de montages. Pour Instagram, c'est du contenu répétitif, peu original.
  4. **Trop de volume, pas assez de qualité.** Publier 4 à 6 reels par jour a dispersé l'effort : chaque reel était moyen. Le volume ne sert à rien quand aucun reel ne passe le premier test.
  5. **La musique est générique.** Des pistes libres de droits, aucun son tendance, aucune voix.
  6. **L'accroche est faible.** La première seconde montre la bague avant de donner une raison de rester (« Marquise 4 carats », « Le feu d'une marquise »). Il manque une tension : une question, une erreur, un chiffre, un « tu ne vas pas croire… ».

## 2. Règles de qualité : le contrôle avant publication

Chaque reel est noté sur 10 avant d'être programmé. **Sous 8/10, il ne sort pas.** La note et le détail vont dans `social_reels.notes`.

| Critère | Points | Exigence |
|---|---|---|
| Accroche (0 à 1,5 s) | 2 | Elle crée une tension (question, erreur, chiffre, conflit, surprise) et se comprend sans le son. Elle ne montre pas seulement une bague. |
| Humain | 2 | Le visage, la voix ou les mains de Rayane, ou une vraie main qui porte la bague à l'annulaire. 0 point pour une bague seule du début à la fin. |
| Raison d'envoyer | 2 | Le spectateur a une raison claire de l'envoyer à quelqu'un : « envoie à ton chum », un choix à trancher, une info utile à garder. |
| Nouveauté | 1 | Une idée et une première image jamais publiées ; plus de 50 % de plans neufs. |
| Image et son | 1 | Image nette et bien étalonnée, sans reflet de Rayane, aucune bague à l'auriculaire. Son vers −14 LUFS. Voix claire, ou musique tendance ajoutée dans l'app. |
| Rythme | 1 | Un nouveau plan ou un nouveau texte toutes les 1,5 à 3 s. Aucun temps mort. Le texte reste à l'écran le temps d'être lu (`pacing.py`). |
| Fin | 1 | Une boucle ou un appel clair : une question en commentaire, « envoie-la à… », la consultation gratuite. |

Règles absolues (un seul manquement suffit pour bloquer la publication) : les faits viennent seulement de `FAITS.md` ; toujours « diamant de laboratoire » ; aucun écran d'une autre marque ; aucune image IA présentée comme une vraie pièce ; aucune mention de crédit sauf celles qui sont permises.

## 3. Volume

- **2 reels d'essai par jour au maximum**, chacun noté 8/10 ou plus. **Un seul**, s'il n'y en a qu'un de bon.
- Un concept nouveau sort en **3 versions qui ne changent que l'accroche** (texte et première image), le même jour ou sur 2 jours. On garde l'accroche qui gagne.
- Les reels déjà programmés qui ne passent pas le contrôle restent publiés tels quels (on ne les retire pas de la file), mais on ne monte plus jamais rien sur ce modèle.

## 4. Musique

- Aucune chanson protégée ne va dans le fichier vidéo. On ne télécharge jamais une chanson depuis un site pirate. Une chanson collée dans le fichier ne compte pas comme un « son tendance » pour Instagram : elle risque d'être coupée ou bloquée.
- **Son tendance** : pour le meilleur reel du jour, l'agent prépare une version sans musique (`_APP`), coupée sur le tempo d'une chanson tendance qu'il nomme. Rayane la publie dans l'app avec cette chanson, en reel d'essai ou en reel normal. Ça lui prend environ 1 minute.
- Les reels publiés par l'outil gardent une piste libre de droits moderne, ou mieux, la **voix de Rayane**.

## 5. Boucle d'amélioration automatique

- **Chaque jour** (production quotidienne) : on relève les chiffres. On classe chaque reel sur 3 signaux : taux de saut à 3 s, temps regardé ÷ durée, envois et partages ÷ portée. On note ce qui a marché ou pas dans `social_reels.lesson`, en une phrase.
- **Chaque dimanche** :
  1. On compare les 3 meilleurs et les 3 pires reels de la semaine. On écrit une leçon par variable : accroche, première image, humain, durée, son, sujet.
  2. On modifie ce fichier : une règle ajoutée, retirée ou resserrée, avec la date et la preuve chiffrée.
  3. On ne teste qu'**une seule variable à la fois** par série de 3 versions.
  4. On fait une veille : 2 recherches de vidéos à plus de 500 000 vues dans la niche. On en tire au moins 1 nouvelle idée de format, ajoutée au §6.
- **Seuils** : un format qui reste sous 300 vues 3 fois de suite est arrêté. Un reel qui dépasse 1 000 vues donne 3 nouvelles versions dans la semaine. Les seuils montent quand la médiane de la semaine les dépasse ; ils ne baissent jamais.

## 6. Formats autorisés

À compléter avec l'étude des vidéos à plus d'un million de vues (§7). Seuls les formats de cette liste peuvent être montés.

## 7. Étude des vidéos à plus d'un million de vues

À venir.
