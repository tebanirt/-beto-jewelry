# Génération des factures / reçus / soumissions

Gabarit officiel confirmé par Rayane (basé sur `Beto-Jewelry_Recu-depot_Maxim-Huard.pdf`,
20 oct. 2026). Voir `beto_doc.py`.

**Logo** : `assets/logo.png` (fichier réel fourni par Rayane — à ne jamais recréer ou
modifier). Si ce fichier est absent, `beto_doc.py` dessine un monogramme de remplacement
et imprime un avertissement — ne jamais envoyer un document à un client dans ce cas.

**Numérotation** : `BJ-AAAA-MMJJ` (facture/soumission), `REC-AAAA-MMJJ` (reçu).

**Règle** : tout document généré doit être montré à Rayane pour confirmation avant
d'être envoyé à un client. Ne jamais changer la palette, la mise en page ou le logo
sans instruction explicite.

**Soumission à options multiples + références visuelles** : voir
`soumission_multi_option.py` — gabarit confirmé le 27 oct. 2026 (première utilisation :
soumission Amanda, bague cathédrale 14k/18k). Réutiliser pour toute soumission avec
plusieurs options de prix et des photos de référence (modèle souhaité, détails de
style). Supporte le français et l'anglais (`lang="fr"` / `"en"`).
