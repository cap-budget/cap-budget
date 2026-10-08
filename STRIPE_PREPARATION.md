# CAP Budget — intégration Stripe (préparation, paiements désactivés)

## Offres validées
- Essai Premium de 7 jours **avec carte bancaire**, uniquement pour l'abonnement mensuel.
- Premium : **3,99 € TTC/mois** après l'essai, sauf résiliation avant l'échéance.
- Accès Premium à vie : **39,99 € TTC en paiement unique**, sans abonnement.
- Les fonctionnalités gratuites de base restent accessibles.

## Architecture à mettre en place
1. Créer dans Stripe deux prix en EUR : un prix récurrent mensuel à 3,99 € et un prix ponctuel à 39,99 €. Ne jamais mettre la clé secrète Stripe dans index.html.
2. Créer une fonction serveur authentifiée `create-checkout-session` : elle identifie l'utilisateur avec son JWT Supabase et crée une session Stripe Checkout liée à son `user_id` côté serveur. Pour le mensuel, configurer `subscription_data.trial_period_days = 7` et collecte de carte dès le début de l'essai. Pour l'achat à vie, utiliser `mode=payment`, sans période d'essai.
3. Créer un webhook Stripe public `stripe-webhook` qui **vérifie la signature Stripe** avec le corps brut et un secret de webhook, traite les événements de manière idempotente, et met à jour `public.cap_premium_access` côté serveur uniquement. Vérifier les événements de souscription, paiement, expiration, remboursement et litige.
4. Vérifier les droits Premium à partir de Supabase et non du navigateur. L'accès d'essai est valide seulement si la date est dans les 7 jours et que l'état Stripe le permet. Ne pas accorder Premium sur la seule page de retour du paiement.
5. Prévoir Stripe Customer Portal pour la résiliation et la gestion de la carte.
6. Tester en mode Stripe test : essai, premier prélèvement, résiliation pendant l'essai, échec de paiement, achat à vie, remboursement, appels webhook répétés, utilisateur non connecté.
7. Avant production : mentions légales, CGV, politique de confidentialité, prix TTC, conditions et date de prélèvement, droit de rétractation et information sur la résiliation.

## État technique au 8 octobre 2026
- Table `public.cap_premium_access` créée dans Supabase avec RLS : lecture par l'utilisateur propriétaire, aucune écriture par les rôles navigateur `anon` et `authenticated`.
- Aucune fonction Stripe déployée et aucun paiement activé.
- Ne pas utiliser un lien Stripe statique seul pour débloquer les droits Premium : l'identité du payeur et la confirmation du paiement doivent être reliées côté serveur.
