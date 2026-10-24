# Journal de session — Beto Jewelry

Résumés datés de ce qui a été construit/corrigé à chaque session de travail avec Claude, pour garder une trace même quand une conversation se termine. Les règles permanentes (comment se comporter) sont dans `business-ops-brief.md`, pas ici — ce fichier est l'historique, pas chargé automatiquement à chaque session (à consulter au besoin).

## 23-24 octobre 2026

**CRM & facturation**
- Diagnostic et correction d'un bug de permission Supabase (42501) bloquant toutes les écritures/lectures du CRM.
- Gabarit officiel de facture/reçu construit (`tools/invoicing/`), reproduisant fidèlement le modèle confirmé (reçu de Maxim Huard) avec le vrai logo. Facture finale de Lee-Vens Caleb Cantave envoyée.
- 3 failles de sécurité corrigées dans le CRM par une session d'audit parallèle (HTML non échappé, injection de filtre Supabase, pages admin non protégées de l'indexation).

**Automatisation Gmail/Facebook**
- Bug Zapier (placeholders "[Full Name]" non remplis) diagnostiqué et corrigé avec Rayane en direct — les vraies données des leads arrivent maintenant correctement.
- 5 vrais leads traités ce soir : Johanne Caron, Kany, Alex Buell, Rachel Pelletier (+ Abdoulaye Cisse, lead antérieur).
- Salutation adaptée à l'heure (Bonjour/Bonsoir), sujet de courriel optimisé pour la conversion, lieu de consultation corrigé ("bureau privé", pas "atelier").

**Bug critique Calendly (clients perdus)**
- Bannière de cookies Calendly bloquait la réservation sur mobile → paramètre `hide_gdpr_banner=1` ajouté.
- Le widget intégré en iframe ne chargeait pas dans les navigateurs intégrés (Gmail, Instagram, Facebook) → lien de secours direct ajouté sur le site, ET tous les courriels clients utilisent maintenant le lien direct `calendly.com/betojewlz` au lieu du lien du site.
- 3 clients déjà contactés ont reçu un courriel d'excuse avec le lien corrigé.

**Nouvelle automatisation**
- Détection automatique des réservations Calendly (via les courriels de confirmation) → brouillon automatique demandant au client : type de pierre, type de métal, type de bijou, photo d'inspiration, détails libres — pour préparer chaque rencontre.

**Mémoire & système**
- Découverte que `docs/design-brief.md` existait mais n'était jamais chargé automatiquement (bug de configuration) → corrigé en le liant dans `CLAUDE.md` avec `docs/business-ops-brief.md` (nouveau fichier de règles opérationnelles créé ce soir).
- Objectif d'affaires fixé : 10-15k$ de **marge** par mois (≈1000$ de profit par pièce vendue, peu importe le prix de vente).
- Rythme de relance optimal recherché et documenté (max 3 relances actives, puis pause jusqu'aux Fêtes/Saint-Valentin).
- Prochaine étape planifiée (section 7bis de `business-ops-brief.md`) : CRM enrichi avec suivi de marge par pièce et statuts plus granulaires, formulaire de préparation avec upload de photo.
