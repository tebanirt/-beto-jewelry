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

- Tables `clients` (statuts : `nouveau → consultation_reservee → consultation_faite → depot_recu → design → production → livre → perdu`) et `submissions`. Colonnes de suivi (26 oct. 2026) : `consultation_at`, `last_contact_at` (dernier message envoyé par Beto), `followup_count` (relances dans l'étape actuelle, remis à 0 à chaque changement de statut), `followups_paused`. Règles de relance codées dans `src/lib/followups.ts` (badge « Relance due » dans `/admin/clients`).
- `/nouveau-client` : formulaire public d'intake (après dépôt hors plateforme, ex. Facebook Marketplace).
- `/admin/clients` : dashboard protégé par mot de passe (session HMAC), jamais indexé (robots.txt + noindex).
- Toujours vérifier les erreurs Supabase (`error`) sur chaque requête — ne jamais laisser un échec d'écriture silencieux.

## 5. Facturation (`tools/invoicing/`)

- Gabarit officiel confirmé le 23 octobre 2026, basé sur `Beto-Jewelry_Recu-depot_Maxim-Huard.pdf` : bandeau or/bronze, mise en page à deux colonnes, tableau, bandeau crème pour le solde, étapes suivantes, pied de page avec les seules coordonnées de Rayane.
- **Soumission à options multiples + photos de référence** (confirmé le 27 oct. 2026, `soumission_multi_option.py`) : pour une soumission présentant plusieurs options de prix (ex. carats de métal différents) avec des photos de référence (modèle souhaité, détails de style). Bilingue (fr/en). Toujours montrer le PDF à Rayane pour confirmation avant tout brouillon de courriel au client — même règle que les autres documents.
- Logo réel dans `tools/invoicing/assets/logo.png` — fourni par Rayane, ne jamais recréer ni modifier. Si le fichier est absent, le script avertit bruyamment ; ne jamais envoyer un document dans ce cas.
- Numérotation : `BJ-AAAA-MMJJ` (facture/soumission), `REC-AAAA-MMJJ` (reçu).
- Pour une ancienne facture à refaire dans ce format : reprendre les infos du client (montant total, date et montant du dépôt, date et montant du paiement final, mode de paiement précisé par Rayane) et reconstruire l'historique complet, même pour un paiement final — jamais juste le solde.
- Toujours régénérer et montrer le PDF à Rayane pour reconfirmation avant tout envoi.
- **Inclusions standard pour toute soumission/devis** (confirmé le 27 oct. 2026) : (1) mise à grandeur gratuite — un ajustement offert après réception, **jamais « à vie »** ; (2) nettoyage et polissage **à vie** (pas d'« essai » — seulement nettoyage et polissage) ; (3) chaque pierre est **toujours accompagnée d'un certificat IGI** — à mentionner systématiquement. Ne pas confondre les deux premières : la mise à grandeur est ponctuelle, l'entretien (nettoyage/polissage) est à vie.
- **Incident du 26 oct. 2026 — ne jamais répéter** : un reçu confirmé par Rayane (via fichier envoyé) a été recréé une deuxième fois (logo redimensionné pour la pièce jointe courriel) sans nouvelle confirmation, et le fichier joint au brouillon s'est corrompu pendant la copie du contenu encodé — le client a reçu un PDF illisible. Règle : **ne jamais régénérer une deuxième copie d'un document après la confirmation de Rayane.** Si une version différente (ex. logo plus léger) est nécessaire pour une pièce jointe, la lui montrer à nouveau avant tout envoi — jamais supposer qu'une version "équivalente" est fiable sans revérification.

## 6. Automatisation Gmail/Calendar

- Triage horaire (`betojewlz@gmail.com`) : classe en Claude/Clients, Claude/Infolettres, ou Claude/À vérifier.
- **Salutation adaptée à l'heure** (fuseau America/Toronto) dans tout brouillon de réponse à un client : « Bonjour » avant 18h00, « Bonsoir » à partir de 18h00. Jamais « Bonjour » par défaut le soir — vérifier l'heure actuelle avant d'écrire la salutation, que ce soit via le triage automatique ou une réponse manuelle dans le chat.
- **Lien de réservation dans les courriels clients** : toujours utiliser le lien direct **https://calendly.com/betojewlz**, jamais `betojewelry.com/design-your-jewelry/consultation` (la page du site avec le calendrier intégré en iframe). Cette page casse dans les navigateurs intégrés (Gmail, Instagram, Facebook) et bloque les clients qui essaient de réserver — bug réel ayant fait perdre des clients le 24 oct. 2026. Le site a quand même un lien de secours direct vers Calendly sous le widget intégré, pour les visiteurs qui arrivent sur cette page par d'autres moyens (recherche, lien en bio, etc.).
- **Sujet des courriels de premier contact** : « {Prénom}, réservons votre consultation gratuite » (personnalisé, orienté action/conversion) — jamais un sujet générique comme « Votre intérêt pour une création sur mesure ». Sans prénom disponible : « Réservons votre consultation gratuite — Beto Jewelry ».
- **Lieu des rencontres clients** : Rayane a un **atelier** à Montréal (où les pièces sont fabriquées — c'est la vraie terminologie de marque, voir `docs/design-brief.md`, ne jamais la changer sur le site) mais reçoit les clients en consultation dans un **bureau privé** séparé, pas à l'atelier. **Deux bureaux privés** (confirmé le 26 oct. 2026) : centre-ville, 1188, avenue Union, Montréal H3B 0E5 (idéal Montréal et Rive-Sud) et Saint-Laurent, 9900, boul. Cavendish, bureau 200, H4M 2V2 (idéal Laval, Rive-Nord, Ouest-de-l'Île). Dans les courriels : « consultation gratuite (45 min à 1h), virtuelle ou dans l'un de nos deux bureaux privés à Montréal » — jamais « atelier » ni « show-room » pour le lieu de consultation. Le site (FAQ, page consultation, contact, page Montréal) a été corrigé le 26 oct. 2026 avec une section « Nos bureaux privés » et un bouton de réservation sous chaque adresse.
- Les leads Facebook/Instagram arrivent via Zapier (sujet exact « Nouveau prospect Facebook/Instagram — Beto Jewelry »), envoyés par le compte à lui-même — Gmail ne les marque pas toujours « non lus », donc il faut aussi les chercher par sujet explicitement.
- Jamais ouvrir un lien de confirmation/vérification de compte tiers — signaler seulement.

### Procédure complète du triage horaire (référencée par le trigger programmé — gardée ici pour ne pas répéter un prompt géant à chaque déclenchement)

1. **Labels** (`list_labels`) : « Claude/Clients », « Claude/Infolettres », « Claude/À vérifier » — utiliser leurs IDs réels.
2. **Trois recherches séparées**, combinées sans doublons :
   - a) `in:inbox is:unread -label:"Claude/Clients" -label:"Claude/Infolettres" -label:"Claude/À vérifier"`
   - b) `in:inbox subject:"Nouveau prospect Facebook/Instagram — Beto Jewelry" -label:"Claude/Clients" -label:"Claude/Infolettres" -label:"Claude/À vérifier"` (jamais filtrer sur `is:unread` ici — voir règle ci-dessus)
   - c) `from:notifications@calendly.com subject:"New Event:" -label:"Claude/Clients" -label:"Claude/Infolettres" -label:"Claude/À vérifier"`
   - **Toujours mettre les noms de labels entre guillemets** (ex. `-label:"Claude/À vérifier"`, pas `-label:Claude/À vérifier`). Bug découvert le 27 oct. 2026 : sans guillemets, Gmail coupe la requête au premier espace et traite le reste comme un mot-clé positif au lieu d'une exclusion — ce qui a fait rater silencieusement plusieurs vrais leads pendant plusieurs heures de triage avant d'être détecté. Ne jamais revenir à la syntaxe sans guillemets.
3. **Classification (a) et (b)** — lire le fil entier (`get_thread`) :
   - *Vrai client/prospect* (site : « Nouvelle demande — ... », ou lead Facebook/Instagram Zapier, ou réponse directe d'un client existant) → rédiger un brouillon selon les règles ci-dessus (salutation/sujet/lien Calendly/lieu) et les faits entreprise ci-dessous → label Claude/Clients → **upsert dans Supabase `clients`** (clé : `email` ; `full_name`, `email`, `phone`, `source`, `status='nouveau'` si nouvelle ligne, `last_contact_at=maintenant` ; ne jamais dupliquer une ligne existante). C'est ce qui alimente la tâche programmée quotidienne de relance — voir §7ter.
   - *Infolettre/marketing* (Calendly, Zoom, ChatGPT, Zapier promo, etc.) → label Claude/Infolettres **et** retirer INBOX (archiver).
   - *Administratif/sécurité à vérifier* (alertes Google, confirmations tierces, réservations Calendly test) → label Claude/À vérifier, laisser dans la boîte, ne rien toucher d'autre.
4. **Recherche (c) = vraies réservations, pas des leads** : extraire nom/courriel invité, type d'événement, date/heure. Nom/courriel visiblement test → Claude/À vérifier, rien d'envoyé. Sinon → nouveau brouillon **direct à l'invité** (pas une réponse à la notif Calendly), sujet « {Prénom}, quelques détails avant notre rencontre du {date} », salutation adaptée à l'heure, remerciement + confirmation date/heure, demande de répondre avec : type de pierre, type de métal, type de bijou, photo d'inspiration si possible, détails libres — préciser que rien n'est obligatoire. Label Claude/Clients sur le fil de la notification (pour ne pas le retraiter).
5. **Synchro calendrier** (betojewlz@gmail.com, fuseau America/Toronto) : pour chaque vrai client/prospect de l'étape 3, si ça correspond à un jalon concret (nouveau lead FB/IG, dépôt 200$ reçu, rendu 3D envoyé, design approuvé, nouvelle demande consultation/devis) → `search_events` d'abord pour éviter tout doublon → si rien, créer un événement court (15-30 min, aujourd'hui), titre « [Nom client] — [jalon] », description avec les faits réels seulement (jamais de prix/dates inventés). Les réservations Calendly créent déjà leur propre événement — ne pas en recréer un pour l'étape 4.
6. **Relances** : gérées par la tâche programmée quotidienne « Relances clients — Beto Jewelry » (8h37, voir §7ter) pour tout client déjà présent dans le CRM — ne pas dupliquer cette logique ici. Pour un fil Claude/Clients qui n'a PAS de ligne CRM correspondante (cas rare depuis que l'étape 3 upsert systématiquement) : recherche légère `search_threads label:"Claude/Clients"`, et si le dernier message date de 3+ jours sans réponse, créer un rappel calendrier (pas un brouillon) pour que Rayane vérifie manuellement.
7. **Résumé final TRÈS court** : « Rien de nouveau. » si rien, sinon nombre de clients traités (en précisant FB/IG, site, ou Calendly), nombre à vérifier, nombre d'événements créés — max 4-5 lignes.

**Faits entreprise pour les brouillons** (en plus des règles de salutation/sujet/lien/lieu ci-dessus) : consultation gratuite (45 min à 1h) → design 3D ~48h → révisions incluses → production ~1,5 semaine après approbation → livraison en mains propres ou expédition assurée. Dépôt design 200$, entièrement crédité sur la pièce finale. Rayane : joaillier diplômé, 500+ créations, communication bilingue directe. Diamants naturels certifiés OU de laboratoire selon le budget, jamais de jugement entre les deux. Ne jamais inventer un prix précis, une date de rendez-vous ou une promesse spécifique non confirmée.

**Infos à demander pour préparer une soumission** (confirmé le 26 oct. 2026, à réutiliser pour tout message de suivi à un prospect, quelle que soit la plateforme — Instagram, SMS, courriel) : type de bijou, type de coupe, carat/grosseur de la pierre, **carat du métal (14k ou 18k — Rayane travaille seulement avec ces deux)** même si le prospect a déjà précisé le type de métal (or blanc/jaune/rose) sans préciser le carat, couleur du métal, et une photo de référence/inspiration si possible. Toujours vérifier ces éléments avant de considérer l'information complète pour une soumission.

**Modèle standard de premier contact** (confirmé le 26 oct. 2026, remplace l'ancien modèle à une seule option) : toujours offrir **les deux chemins** au prospect, jamais un seul — (1) préparer une soumission directement s'il fournit les infos ci-dessus, **ou** (2) réserver une consultation gratuite (lien Calendly) pour que Rayane regarde exactement ce qu'il veut et le conseille en personne. Ne jamais présumer qu'un prospect préfère l'un ou l'autre — toujours donner le choix.

## 6bis. Automatisation post-réservation Calendly (active depuis le 24 oct. 2026)

Quand quelqu'un réserve via Calendly, Calendly envoie une notification « New Event: ... » à betojewlz@gmail.com. Le triage horaire détecte ces courriels (recherche séparée des leads Facebook) et prépare automatiquement un brouillon adressé directement au client, lui demandant de répondre avec : type de pierre, type de métal, type de bijou, une photo d'inspiration en pièce jointe si disponible, et des détails libres. Pas de nouveau formulaire web — la réponse du client arrive directement par courriel, que Rayane peut lire avant la rencontre. Le lien Calendly (betojewlz@gmail.com) est déjà le calendrier qui reçoit les événements, donc aucune config supplémentaire nécessaire.

## 7ter. Relances automatiques (actives depuis le 26 oct. 2026 — tâche programmée « Relances clients — Beto Jewelry », tous les jours 8 h 37)

- **Brouillons seulement**, jamais d'envoi. Rayane relit et envoie lui-même.
- Rythme : `nouveau` → J+4 et J+10 après la création ; `consultation_faite` → J+2 et J+10 après la consultation. Puis pause (relance passive Fêtes/Saint-Valentin, pas encore automatisée).
- Jamais de relance si `followups_paused`, si le client a répondu en dernier dans Gmail (c'est à Rayane de répondre), ou si un brouillon pour ce client existe déjà.
- Synchro Calendly → CRM : chaque notification « New Event » met le client en `consultation_reservee` avec `consultation_at` (création du client s'il n'existe pas, source « Calendly »).
- Consultation passée mais statut encore `consultation_reservee` : signalé dans le résumé (Rayane met `consultation_faite` ou `depot_recu`).
- Ton : chaleureux, court, jamais pressant ; toujours les deux chemins (soumission ou consultation via https://calendly.com/betojewlz) ; mentionner les deux bureaux privés (centre-ville, avenue Union / Saint-Laurent, Cavendish) ; salutation selon l'heure.
- Remplace l'étape 6 du triage horaire pour les clients présents dans le CRM (le triage garde les rappels calendrier pour les fils hors CRM — et alimente le CRM pour les leads FB/IG/site, voir étape 3).

## 7bis. À construire (spécifié le 24 oct. 2026 — rythme de relance et CRM enrichi faits le 26 oct., voir §7ter)

**Connexion Calendly → CRM/courriel automatique** (spécifié le 24 oct. 2026, toujours à construire) : détecter quand un client réserve via Calendly (probablement via Zapier, même pattern que pour les leads Facebook/Instagram), puis envoyer automatiquement un courriel avec un lien vers un formulaire de préparation à la rencontre, collectant : type de pierre (déjà capté par les pubs : diamant naturel/laboratoire/pierre précieuse), type de métal souhaité, type de bijou, une photo d'inspiration si disponible (upload à construire — n'existe pas encore sur le site), et un champ texte libre pour d'autres détails.

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
