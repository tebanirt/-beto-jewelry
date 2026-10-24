# MÉGA PROMPT — Beto Jewelry, Opérations & CRM

Référence durable pour tout travail de CRM, facturation, courriels et opérations sur ce projet. Confirmée par Rayane. Ne pas modifier sans son accord.

## 1. Qui je suis

Rayane Tebani, fondateur de Beto Jewelry — 438-874-5759, Montréal. **Courriel d'entreprise officiel : betojewlz@gmail.com** — c'est celui-là qui doit apparaître sur tous les documents clients (factures, reçus, soumissions), jamais une adresse personnelle. Lauren Kennedy est sa conjointe ; elle a signé certains courriels (ex. reçus de dépôt) pendant la période de transition avant que betojewlz@gmail.com soit pleinement connecté à un compte bancaire d'entreprise — une fois cette transition terminée, seules les coordonnées de Rayane doivent apparaître sur les documents officiels.

## 2. Règles absolues (jamais sans confirmation explicite, à chaque fois)

- **Jamais pousser (`git push`) vers GitHub sans confirmation explicite et séparée de Rayane**, même après une confirmation antérieure pour un autre changement.
- **Jamais envoyer un vrai courriel à un client** (`send_message`/`reply`/`forward`) — uniquement des brouillons Gmail (`create_draft`) que Rayane valide et envoie lui-même.
- **Jamais confirmer/envoyer une facture sans que Rayane la confirme explicitement d'abord** — toujours lui montrer le PDF généré avant.
- **Jamais changer le logo, la palette ou la mise en page des documents officiels** sans instruction explicite, même pour une « amélioration ».
- Les marges et données financières internes ne sont **jamais visibles par les clients** — seulement par Rayane (dashboard admin protégé par mot de passe).

## 3. Positionnement de marque (résumé — voir `docs/design-brief.md` pour la direction visuelle complète)

Luxe moderne, épuré, confiance avant tout. Pas un e-commerce catalogue — un tunnel de conversion basé sur un service : consultation → dépôt de design (200$) → design 3D 48h → révisions → production ~1,5 semaine → livraison.

## 4. CRM (Supabase)

- Tables `clients` (statuts : `nouveau → consultation → depot_recu → design → production → livre → perdu`) et `submissions`.
- `/nouveau-client` : formulaire public d'intake (après dépôt hors plateforme, ex. Facebook Marketplace).
- `/admin/clients` : dashboard protégé par mot de passe (session HMAC), jamais indexé (robots.txt + noindex).
- Toujours vérifier les erreurs Supabase (`error`) sur chaque requête — ne jamais laisser un échec d'écriture silencieux.

## 5. Facturation (`tools/invoicing/`)

- Gabarit officiel confirmé le 23 octobre 2026, basé sur `Beto-Jewelry_Recu-depot_Maxim-Huard.pdf` : bandeau or/bronze, mise en page à deux colonnes, tableau, bandeau crème pour le solde, étapes suivantes, pied de page avec les seules coordonnées de Rayane.
- Logo réel dans `tools/invoicing/assets/logo.png` — fourni par Rayane, ne jamais recréer ni modifier. Si le fichier est absent, le script avertit bruyamment ; ne jamais envoyer un document dans ce cas.
- Numérotation : `BJ-AAAA-MMJJ` (facture/soumission), `REC-AAAA-MMJJ` (reçu).
- Pour une ancienne facture à refaire dans ce format : reprendre les infos du client (montant total, date et montant du dépôt, date et montant du paiement final, mode de paiement précisé par Rayane) et reconstruire l'historique complet, même pour un paiement final — jamais juste le solde.
- Toujours régénérer et montrer le PDF à Rayane pour reconfirmation avant tout envoi.

## 6. Automatisation Gmail/Calendar

- Triage horaire (`betojewlz@gmail.com`) : classe en Claude/Clients, Claude/Infolettres, ou Claude/À vérifier.
- **Salutation adaptée à l'heure** (fuseau America/Toronto) dans tout brouillon de réponse à un client : « Bonjour » avant 18h00, « Bonsoir » à partir de 18h00. Jamais « Bonjour » par défaut le soir — vérifier l'heure actuelle avant d'écrire la salutation, que ce soit via le triage automatique ou une réponse manuelle dans le chat.
- **Lien de réservation dans les courriels clients** : toujours utiliser le lien direct **https://calendly.com/betojewlz**, jamais `betojewelry.com/design-your-jewelry/consultation` (la page du site avec le calendrier intégré en iframe). Cette page casse dans les navigateurs intégrés (Gmail, Instagram, Facebook) et bloque les clients qui essaient de réserver — bug réel ayant fait perdre des clients le 24 oct. 2026. Le site a quand même un lien de secours direct vers Calendly sous le widget intégré, pour les visiteurs qui arrivent sur cette page par d'autres moyens (recherche, lien en bio, etc.).
- **Sujet des courriels de premier contact** : « {Prénom}, réservons votre consultation gratuite » (personnalisé, orienté action/conversion) — jamais un sujet générique comme « Votre intérêt pour une création sur mesure ». Sans prénom disponible : « Réservons votre consultation gratuite — Beto Jewelry ».
- **Lieu des rencontres clients** : Rayane a un **atelier** à Montréal (où les pièces sont fabriquées — c'est la vraie terminologie de marque, voir `docs/design-brief.md`, ne jamais la changer sur le site) mais reçoit les clients en consultation dans un **bureau privé** séparé, pas à l'atelier. Dans les courriels : « consultation gratuite (45 min à 1h), virtuelle ou dans mon bureau privé à Montréal » — jamais « atelier » ni « show-room » pour le lieu de consultation. Le site web (FAQ, page consultation) dit actuellement que les clients viennent « à l'atelier sur rendez-vous » — c'est factuellement imprécis (ils viennent au bureau privé), à corriger un jour si Rayane le demande, mais pas fait sans sa confirmation explicite.
- Les leads Facebook/Instagram arrivent via Zapier (sujet exact « Nouveau prospect Facebook/Instagram — Beto Jewelry »), envoyés par le compte à lui-même — Gmail ne les marque pas toujours « non lus », donc il faut aussi les chercher par sujet explicitement.
- Jamais ouvrir un lien de confirmation/vérification de compte tiers — signaler seulement.

## 6bis. Automatisation post-réservation Calendly (active depuis le 24 oct. 2026)

Quand quelqu'un réserve via Calendly, Calendly envoie une notification « New Event: ... » à betojewlz@gmail.com. Le triage horaire détecte ces courriels (recherche séparée des leads Facebook) et prépare automatiquement un brouillon adressé directement au client, lui demandant de répondre avec : type de pierre, type de métal, type de bijou, une photo d'inspiration en pièce jointe si disponible, et des détails libres. Pas de nouveau formulaire web — la réponse du client arrive directement par courriel, que Rayane peut lire avant la rencontre. Le lien Calendly (betojewlz@gmail.com) est déjà le calendrier qui reçoit les événements, donc aucune config supplémentaire nécessaire.

## 7bis. À construire (spécifié le 24 oct. 2026, prêt à démarrer dès que Rayane le demande)

**Rythme de relance** (recherché et confirmé le 24 oct. 2026, voir section 2 pour les règles de brouillon) :
- Jamais réservé après contact pub : J+1 (déjà automatique), J+4, J+10, puis pause → relance passive aux Fêtes/Saint-Valentin.
- Consultation eue, pas d'achat : J+2 après la rencontre, J+10, puis pause → relance passive aux Fêtes/Saint-Valentin.
- Maximum 3 relances actives — jamais plus, pour ne pas être pressant.

**CRM enrichi** : ajouter un suivi plus granulaire que le statut actuel (`nouveau → consultation → depot_recu → ...`) — distinguer clairement "a réservé mais pas encore eu la consultation", "a eu la consultation mais pas acheté", avec horodatage de dernier contact et compteur de relances, pour piloter automatiquement le rythme ci-dessus sans doublons ni oublis.

**Connexion Calendly → CRM/courriel automatique** : détecter quand un client réserve via Calendly (probablement via Zapier, même pattern que pour les leads Facebook/Instagram), puis envoyer automatiquement un courriel avec un lien vers un formulaire de préparation à la rencontre, collectant : type de pierre (déjà capté par les pubs : diamant naturel/laboratoire/pierre précieuse), type de métal souhaité, type de bijou, une photo d'inspiration si disponible (upload à construire — n'existe pas encore sur le site), et un champ texte libre pour d'autres détails.

## 7. Différé (ne pas travailler là-dessus avant que Rayane le redemande)

- QuickBooks / comptabilité et notifications bancaires RBC : après incorporation légale de l'entreprise.
- Parsing automatique des factures fournisseurs pour calcul de marge : bloqué sur les mêmes clients post-incorporation.

## 8. Objectif chiffré et écosystème d'agents

**Objectif d'affaires (fixé le 24 oct. 2026)** : atteindre 10 000 à 15 000 $ de **profit/marge** par mois d'ici la fin de l'année — soit 10 à 15 ventes/mois générant chacune environ 1 000 $ de marge. **Le 1 000 $ est un objectif de marge par pièce, pas un prix de vente minimum** : le prix de vente et le coût de production varient selon la pièce (carat, matériaux), mais la marge cible reste ~1 000 $ par vente (ex. solitaire 1 carat coûtant 1 000 $ vendu 2 000 $, ou pièce 3-4 carats coûtant 2 500 $ vendue 3 500 $ — même marge de 1 000 $ dans les deux cas). Toute recommandation stratégique (marketing, optimisation, priorités) doit se mesurer par rapport à cet objectif de marge, pas de chiffre d'affaires brut. Le suivi de marge nécessite le coût de production par pièce, pas seulement le prix de vente/dépôt — donnée à ajouter au CRM, jamais visible des clients (voir règle absolue sur les marges, section 2).

**Convention « table ronde d'experts »** : à chaque étape cruciale, nouveau projet, ou idée amenée par Rayane — pas seulement sur demande explicite — structurer la réponse comme une vraie table ronde de professionnels spécialisés plutôt qu'une réponse générique unique. Concrètement :
- Identifier quels domaines sont concernés (marketing, codage/optimisation technique, comptabilité/finances, etc.) et donner l'avis de chacun séparément et clairement identifié (ex. **Marketing** : ..., **Codage** : ...), pas noyé dans un paragraphe vague.
- Quand les domaines se recoupent (ex. un changement marketing qui demande un changement de code), le dire explicitement — qui doit faire quoi, dans quel ordre.
- Toujours baser les conseils sur une vraie recherche (web, forums) quand le sujet le justifie — jamais une réponse de mémoire présentée comme à jour.
- Rester concret et actionnable : des étapes, pas des généralités.
- Les décisions impliquant de l'argent (budget pub, dépenses) restent toujours entre les mains de Rayane — jamais exécutées de façon autonome.

**Écosystème d'agents autonomes (vision long terme)** : Rayane veut des agents qui travaillent pour lui en continu, même pendant qu'il dort — pas seulement un assistant réactif. Déjà en place :
- Triage Gmail/Calendar horaire (agent "acquisition/service client").
- Routine d'audit du site (`AUDIT_LOG.md`) — agent "codage/qualité".

Prochaines briques (en attente que Rayane connecte les outils sur claude.ai, je ne peux pas les connecter moi-même) :
- Supermetrics (lecture des performances publicitaires réelles Facebook/Instagram) → agent "marketing".
- Bird (envoi WhatsApp/SMS) → canal de notification proactive.
- Une fois ces deux connectés : une routine programmée (ex. quotidienne) qui vérifie performance pub + pipeline CRM, et envoie un résumé "table ronde" proactif par WhatsApp.

Ne pas ajouter n8n ou un autre orchestrateur externe sans raison précise — l'approche de triggers programmés Claude Code fait déjà ce travail et évite la complexité/maintenance d'un deuxième système parallèle.

## 9. Boucle d'amélioration

Ce fichier doit être mis à jour à chaque nouvelle règle ou correction durable que Rayane donne — pas seulement retenue en mémoire de conversation, qui disparaît. Si une instruction est censée s'appliquer « toujours » ou « à partir de maintenant », elle appartient ici, pas seulement au chat.
