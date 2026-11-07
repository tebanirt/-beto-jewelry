---
name: beto-comptabilite
description: Règles de comptabilité, de taxes (TPS/TVQ, Québec) et de suivi d'argent propres à Beto Jewelry. À utiliser pour toute question ou tâche qui touche l'argent de l'entreprise — prix avec ou sans taxes, calcul de TPS/TVQ, factures fournisseurs, mémos, reçus clients, dépôts et paiements à enregistrer, coûts et marges, bilan trimestriel avec le comptable (Abraham), message au comptable, mot-clé #argent.
---

# Comptabilité Beto Jewelry (Québec)

Règles décidées par Rayane. Elles priment sur tout conseil comptable générique. La source complète est `docs/business-ops-brief.md` (§2, §4, §5, §7, §8ter) : en cas de doute ou de contradiction, le brief gagne, puis demander à Rayane.

## Taxes
- **TPS 5 %** et **TVQ 9,975 %** (total 14,975 %), calculées sur le prix avant taxes, arrondies au cent.
- Taxes **perçues dès maintenant sur chaque paiement** (dépôt, 50 % à l'approbation, solde), même avant la réception des numéros TPS/TVQ (Abraham, 6 nov. 2026).
- Les prix aux clients s'annoncent **avant taxes**, avec le total taxes incluses quand le client le demande (ex. 2 600 $ + 130,00 $ TPS + 259,35 $ TVQ = 2 989,35 $).
- Une soumission ou une facture déjà envoyée garde son montant : on ne la change pas après coup sans l'accord de Rayane.
- **Question ouverte (6 nov. 2026)** : taxes sur les ventes Facebook Marketplace. Rayane a dit « seulement les clients du site ». Une fois l'entreprise inscrite, la loi applique les taxes à toutes les ventes. Ne rien appliquer de différent sans la confirmation d'Abraham ; le rappeler à Rayane si le sujet revient.

## Coûts, marges et taxes payées aux fournisseurs
- **Tous les coûts et prix donnés par Rayane sont avant taxes.** Les marges se calculent avant taxes des deux côtés.
- Les taxes payées aux fournisseurs sont récupérées par les **crédits et remboursements de taxe sur les intrants (CTI/RTI)** dans la déclaration : elles ne réduisent pas la marge.
- Pour récupérer ces taxes, il faut une **vraie facture** du fournisseur avec son nom et ses numéros TPS/TVQ. Un **MEMO** (consignation, ex. Divine Diamond Inc) n'est pas une facture : demander la facture finale quand la pierre est achetée.
- Garder toutes les factures et tous les reçus fournisseurs (Fonte LB, pierres, sertissage, polissage, gemmologue, douane). Les classer dans Google Drive `Comptabilité/{année}/{mois}` ; si c'est impossible, dire à Rayane quel fichier classer lui-même.
- Coûts et prix réels : jamais dans ce dépôt public. Ils vivent dans Supabase (`pricing_config`, `orders`, `payments`).

## Enregistrer l'argent (Supabase)
- **Tout paiement est enregistré, comptant compris.** Aucun revenu hors de la comptabilité transmise au comptable.
- Commandes dans `orders`, paiements dans `payments`. Le coût d'une commande va dans `orders.production_cost` ; les colonnes `sale_price` et `production_cost` du client sont la somme de ses commandes.
- Un coût partiel (ex. seulement la fonte) reste dans les notes de la commande, pas dans `production_cost`, tant qu'il est incomplet. Quand une estimation est remplacée par un vrai coût, noter l'ancien et le nouveau montant et la marge qui en découle.
- Les chiffres officiels (chiffre d'affaires, coûts, marge par mois, provenance) viennent des vues `v_ventes`, `v_mois` et `v_canaux`. Ne pas recalculer autrement.
- Toute écriture d'argent (prix, montants, paiements, dépôts, factures, reçus) se fait seulement avec l'accord de Rayane, sauf l'enregistrement d'un coût fournisseur qu'il envoie lui-même avec #argent.
- Les marges et coûts ne sont jamais visibles par un client : seulement Rayane et Lauren.

## Repères de l'entreprise
- Dépôt de design : 250 $ (site, pubs, Calendly), 150 $ sur Facebook Marketplace, crédité à 100 % sur la pièce. Si aucun design ne convient : 150 $ gardés, 100 $ remboursés.
- 50 % à l'approbation du rendu 3D, puis le solde à la remise.
- Certificat d'authenticité (gemmologique) de la pièce complète : toujours inclus dans le prix (50 $ ajoutés au prix ; coût réel dans `referenceCosts`).
- Objectif : environ 1 000 $ de marge par pièce, 10 à 15 ventes par mois.

## Documents et comptable
- Factures et reçus : gabarit officiel de `tools/invoicing/` ; numéros `BJ-AAAA-MMJJ` (facture, soumission) et `REC-AAAA-MMJJ` (reçu). Toujours montrer le PDF à Rayane avant tout envoi ; ne jamais régénérer un document déjà confirmé.
- Le bilan avec le comptable se fait **chaque trimestre**.
- Messages au comptable : ne pas parler du seuil de 30 000 $ ni des ventes d'avant. La rémunération de Rayane et de Lauren se règle à l'interne.
- Ne jamais rien payer soi-même.

## Avant de conseiller
Pour toute décision d'argent, donner d'abord un avis de pro (Finances, Ventes, Marketing), appuyé sur une recherche et sur l'effet sur la marge par pièce, puis laisser Rayane décider. Pour une question fiscale pointue, recommander de la confirmer avec Abraham plutôt que d'improviser.
