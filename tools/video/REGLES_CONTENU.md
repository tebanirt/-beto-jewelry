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
| Humain ou image d'exception | 2 | Le visage, la voix ou les mains de Rayane, ou une vraie main qui porte la bague à l'annulaire. Seule exception : la « boucle produit » (format A du §6), si l'image est un vrai macro qui brille et que le son tendance est ajouté dans l'app. Sinon, une bague seule du début à la fin vaut 0 point. |
| Raison d'envoyer | 2 | Le spectateur a une raison claire de l'envoyer à quelqu'un : « envoie à ton chum », un choix à trancher, une info utile à garder. |
| Nouveauté | 1 | Une idée et une première image jamais publiées ; plus de 50 % de plans neufs. |
| Image et son | 1 | Image nette et bien étalonnée, sans reflet de Rayane, aucune bague à l'auriculaire. Son vers −14 LUFS. Voix claire, ou musique tendance ajoutée dans l'app. |
| Rythme | 1 | Un nouveau plan ou un nouveau texte toutes les 1,5 à 3 s. Aucun temps mort. Le texte reste à l'écran le temps d'être lu (`pacing.py`). |
| Fin | 1 | Une boucle ou un appel clair : une question en commentaire, « envoie-la à… », la consultation gratuite. |

Règles absolues (un seul manquement suffit pour bloquer la publication) : les faits viennent seulement de `FAITS.md` ; toujours « diamant de laboratoire » ; aucun écran d'une autre marque ; aucune image IA présentée comme une vraie pièce ; aucune mention de crédit sauf celles qui sont permises.

## 3. Volume

- **3 reels d'essai par jour au maximum**, chacun noté 8/10 ou plus. S'il n'y en a qu'un de bon, on n'en publie qu'un. Rayane veut « essayer le plus de choses » : les reels d'essai sont faits pour ça, parce qu'ils ne touchent pas les abonnés. Mais on n'essaie que des choses de qualité.
- Un concept nouveau sort en **3 versions qui ne changent que l'accroche** (texte et première image), sur 1 ou 2 jours. On garde l'accroche qui gagne.
- Les reels déjà programmés qui ne passent pas le contrôle restent publiés tels quels (on ne les retire pas de la file), mais on ne monte plus jamais rien sur ce modèle.

## 4. Musique

- Aucune chanson protégée ne va dans le fichier vidéo. On ne télécharge jamais une chanson depuis un site pirate. Une chanson collée dans le fichier ne compte pas comme un « son tendance » pour Instagram : elle risque d'être coupée ou bloquée.
- **Son tendance** : pour le meilleur reel du jour, l'agent prépare une version sans musique (`_APP`), coupée sur le tempo d'une chanson tendance qu'il nomme. Rayane la publie dans l'app avec cette chanson, en reel d'essai ou en reel normal. Ça lui prend environ 1 minute.
- Les reels publiés par l'outil gardent une piste libre de droits moderne, ou mieux, la **voix de Rayane**.
- **À tester** : depuis juin 2026, l'Audio API de Meta permet d'ajouter par l'API un son de la bibliothèque autorisé pour les tiers (`audio_configuration`, recherche `/ig_audio` ; sans requête, elle renvoie les sons tendance). Il faut un compte Business relié à une page Facebook. Il faut encore vérifier si ça marche pour les reels d'essai et si Supermetrics l'expose. On teste sur 1 reel dès que l'accès Meta officiel (utilisateur système) fonctionne. Source : developers.facebook.com/documentation/instagram-platform/content-publishing/audio-api.

## 5. Boucle d'amélioration automatique

- **Chaque jour** (production quotidienne) : on relève les chiffres. On classe chaque reel sur 3 signaux : taux de saut à 3 s, temps regardé ÷ durée, envois et partages ÷ portée. On note ce qui a marché ou pas dans `social_reels.lesson`, en une phrase.
- **Chaque dimanche** :
  1. On compare les 3 meilleurs et les 3 pires reels de la semaine. On écrit une leçon par variable : accroche, première image, humain, durée, son, sujet.
  2. On modifie ce fichier : une règle ajoutée, retirée ou resserrée, avec la date et la preuve chiffrée.
  3. On ne teste qu'**une seule variable à la fois** par série de 3 versions.
  4. On fait une veille : 2 recherches de vidéos à plus de 500 000 vues dans la niche. On en tire au moins 1 nouvelle idée de format, ajoutée au §6.
- **Seuils** : un format qui reste sous 300 vues 3 fois de suite est arrêté. Un reel qui dépasse 1 000 vues donne 3 nouvelles versions dans la semaine. Les seuils montent quand la médiane de la semaine les dépasse ; ils ne baissent jamais.

## 6. Formats autorisés

Seuls ces formats peuvent être montés. Chacun vient des vidéos de bijoutiers à plus d'un million de vues (§7). Un format arrêté par la boucle (§5) sort de la liste, avec la date.

| # | Format | Durée | Ce qu'on voit à 0 s | Son | Ce qu'il faut de Rayane |
|---|---|---|---|---|---|
| A | **Boucle produit** : la bague en macro qui brille, 2 ou 3 plans, au plus une ligne de texte. La fiche complète va dans la description, avec « Enregistre-la pour plus tard ». | 7 à 12 s | Le plus bel éclat de la pierre, déjà en mouvement | Son tendance ajouté dans l'app | Rien (plans au plateau tournant) |
| B | **Prix d'abord** : le prix est le premier texte, puis la bague portée ou en macro. | 12 à 15 s | « 2 300 à 2 400 $ + taxes » en gros | Son tendance | Une bague qui correspond exactement au prix |
| C | **POV d'envie** : « POV : tu voulais une bague que personne d'autre n'a… », puis le rendu 3D, puis la vraie bague. | 9 à 20 s | Le texte POV sur le plus beau plan | Son tendance | Un vrai rendu 3D de MatrixGold et la bague finie |
| D | **Comparaison** : « 1, 2 ou 3 carats ? » ou « ovale ou marquise ? », même cadrage, 2 s chacune, la question reste à l'écran. | 6 à 12 s | La question | Son tendance | Des pierres ou des bagues sur l'annulaire |
| E | **Explication parlée** : Rayane parle dès 0 s. Les modèles : classement de 1 à 10 dévoilé dans le désordre (2,5 s par élément) ; « 4 erreurs à éviter » (8 s par élément) ; question puis « tu penses que c'est… ? Non : … » ; mythe démonté. Pas d'intro, pas de logo. | 30 à 80 s | Le visage de Rayane qui pose la question | Sa voix, et une musique très basse | Le visage et la voix |
| F | **Avant le oui** : la fin d'abord (la main qui porte la bague), puis « 48 h plus tôt… » : le rendu 3D, la fonte, le sertissage, la remise. | 15 à 25 s | La bague portée | Son tendance ou voix | Des plans de l'atelier, avec l'accord du client |
| G | **Mème de joaillier** : « Client : “quelque chose de simple” / Moi, révision 3 du rendu ». | 7 à 9 s | Le texte du mème | Son tendance | Rien, ou une réaction de Rayane |
| H | **Histoire d'un client** : le prénom (avec son accord écrit), ce qui était en jeu, la bague. | 45 à 90 s | La phrase d'enjeu dite par Rayane | Sa voix | La voix ou le visage, et l'accord écrit du client |

**Ce qui est interdit** : les reels de prix seuls sur une bague seule, sans son tendance (série C_, 4 à 124 vues) ; les montages de 20 à 30 s sans voix ; la comparaison avec le site d'une autre marque (une marque à l'écran est interdite).

## 7. Étude des vidéos à plus d'un million de vues (TikTok, juin à nov. 2026)

Méthode : 8 recherches ScrapeCreators. On a gardé 48 vidéos de bijouterie à plus d'un million de vues ; la liste complète est dans `scratchpad/tiktok/jewelry_1m.tsv`. La recherche Instagram de l'outil ne trie pas par vues : l'étude ne porte donc que sur TikTok. Ce qui concerne l'image elle-même est déduit des descriptions et des transcriptions.

- **La taille du compte ne bloque pas** : 17 des 48 vidéos viennent de comptes de moins de 20 000 abonnés, et 5 de comptes de moins de 3 000.
- **Les formats** :
  - Boucle produit en macro : 23 vidéos sur 48, 2,4 M de vues en moyenne. Elles durent 7 à 23 s (environ 12 s le plus souvent), 22 sur 23 ont un son ajouté, aucune n'est parlée, et la fiche est dans la description.
  - Explications parlées : 6 vidéos, 2,8 M en moyenne, 30 à 287 s. La voix commence dès 0 s.
  - POV d'envie : 5 vidéos, 7,5 M en moyenne, 9 à 22 s.
  - Prix en premier : 6,4 M en moyenne, avec le meilleur taux d'enregistrement (2,1 %).
  - Mème : 10,3 M en moyenne, avec le meilleur taux de partage (2,9 %).
  - Comparaison « 1, 3 ou 5 ? » : 2,7 M en moyenne.
- **Les explications** : la première parole arrive entre 0,00 et 0,18 s. Exemples :
  - Une question, puis « tu penses D ? Non, F », puis le plus gros chiffre à la fin (@nextdoorjeweler, 9,5 M).
  - Un classement de 1 à 10, 2,5 s par forme (@elijewelry.mi, 2 400 abonnés, 1 M).
  - « 4 pierres à éviter », 8 s par pierre (@contesetjoyaux, en français, 1,4 M).
  - Une affirmation provocante, puis « envoie ça à ta blonde » : 5,5 % de partages (@alexclick_, en français).
- **Les bagues portées par des clientes**, de 7 à 12 s avec un son ajouté, ont fait 3 à 10,8 M de vues, dont une sur un compte de 463 abonnés.

## 8. Les niches à viser (une à la fois, 3 accroches par niche)

1. Diamant de laboratoire : mythes et vérités (notre meilleure niche : W05 et W06).
2. Les formes allongées : marquise et ovale.
3. Halo caché et pierre secrète dans l'anneau.
4. Diamants de couleur : rose, jaune, bleu, vert.
5. Le gars qui prépare sa demande : budget, taille, secret.
6. Prix et transparence, au Québec : « ce que 2 400 $ t'achète ».
7. Montréal et le français : « bague de fiançailles Montréal », un joaillier qui parle français.

## 9. Objectif réaliste pour les 2 prochaines semaines (27 nov. au 11 déc.)

Rayane vise « 10 clients des reels d'ici 2 semaines ». Avec 237 abonnés et environ 100 vues par reel, c'est très peu probable. Ce qui est réaliste si les règles marchent :
- 1 ou 2 reels qui passent 1 000 vues (aujourd'hui, notre record est 165) ;
- 10 conversations en message privé venues d'Instagram ;
- 3 à 5 consultations réservées venues d'Instagram ;
- 1 à 3 dépôts.

Les leviers gratuits qui s'ajoutent aux reels :
- le « commentaire → message » de Meta Business Suite, avec le mot-clé « BAGUE » ;
- une story par jour, avec un sondage ;
- les 3 meilleures publications épinglées ;
- répondre à chaque commentaire dans l'heure ;
- la recherche par IA : Sébastien a trouvé Beto Jewelry par ChatGPT.
