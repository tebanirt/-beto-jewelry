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
- Les leads Facebook/Instagram arrivent via Zapier (sujet exact « Nouveau prospect Facebook/Instagram — Beto Jewelry »), envoyés par le compte à lui-même — Gmail ne les marque pas toujours « non lus », donc il faut aussi les chercher par sujet explicitement.
- Jamais ouvrir un lien de confirmation/vérification de compte tiers — signaler seulement.

## 7. Différé (ne pas travailler là-dessus avant que Rayane le redemande)

- QuickBooks / comptabilité et notifications bancaires RBC : après incorporation légale de l'entreprise.
- Parsing automatique des factures fournisseurs pour calcul de marge : bloqué sur les mêmes clients post-incorporation.

## 8. Boucle d'amélioration

Ce fichier doit être mis à jour à chaque nouvelle règle ou correction durable que Rayane donne — pas seulement retenue en mémoire de conversation, qui disparaît. Si une instruction est censée s'appliquer « toujours » ou « à partir de maintenant », elle appartient ici, pas seulement au chat.
