# CAP Budget V2 — Mode Anti-Gaspillage & Petites Victoires

Statut : **idée validée pour la feuille de route V2 — non développée**.

## Objectif
Transformer les économies du quotidien en cagnottes concrètes, de manière gratifiante et ludique, avec CAP Conseil (robot conseil).

## 1. « J'ai résisté à une dépense » — Petites Victoires
- Saisir le montant d'un achat impulsif évité (café, commande à emporter, etc.).
- Afficher un encouragement personnalisé du robot CAP Conseil.
- Cumuler les montants dans un compteur d'économies **estimées**, avec date et motif facultatif.
- Permettre la correction ou suppression d'une saisie.

## 2. Frigo / Repas — cuisiner avec les restes
- Après une recette utilisant les restes du frigo, proposer une économie forfaitaire facultative (exemple : 10 €).
- L'utilisateur valide ou modifie le montant ; aucune économie n'est supposée réelle automatiquement.
- Associer la victoire à une cagnotte virtuelle « Voyages » ou « Animaux / Urgences ».
- Éviter de compter deux fois une même économie.

## 3. Traqueur d'abonnements inutiles
- Checklist des abonnements non utilisés.
- Montant mensuel renseigné par l'utilisateur.
- Calculer l'économie annuelle **potentielle** : montant mensuel × 12.
- Distinguer « à examiner », « résiliation demandée » et « résiliation confirmée » ; cocher un abonnement ne le résilie pas.

## Règles de fiabilité et confidentialité
- **Ne jamais créditer automatiquement le compte bancaire, le budget disponible ou l'épargne réelle** à partir d'une dépense évitée ou d'une économie forfaitaire.
- Distinguer économies potentielles, économies déclarées et transferts d'argent réellement confirmés par l'utilisateur.
- Ne pas déduire automatiquement une charge récurrente du budget avant confirmation de sa résiliation effective.
- Utiliser les mêmes règles d'accès et de sauvegarde sécurisée que les autres données personnelles de CAP.
- Interface accessible, peu de clics, lisible sur mobile.
- Définir le périmètre gratuit/Premium et les écrans avant développement.

## Parcours V2 proposé
1. L'utilisateur clique sur « J'ai résisté à une dépense » ou « J'ai cuisiné avec les restes ».
2. Il confirme le montant économisé estimé.
3. CAP Conseil félicite et met à jour le compteur virtuel.
4. L'utilisateur peut affecter cette victoire à un objectif (Voyages ou Animaux / Urgences).
5. Un transfert d'argent réel éventuel est une action séparée, confirmée par l'utilisateur.
