# free-cards-tcg-simulator
Simulateur personnel d’ouverture de boosters et de collection Pokémon TCG.

## Ouverture serveur

Les comptes connectés utilisent la fonction Supabase `open-booster`. Elle récupère le catalogue public Pokémon TCG côté serveur, applique les taux de drop (70 % rare classique, 20 % ultra rare, 10 % secret/SIR), puis exécute la mutation économique dans `open_boosters_internal`.

Après avoir exécuté le SQL affiché dans **Compte → SQL sécurité et économie serveur** :

```powershell
supabase functions deploy open-booster
```

La fonction doit disposer de `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` dans son environnement Supabase. Ne mettez jamais la clé `service_role` dans `index.html`.

Tant que la fonction n’est pas déployée, une ouverture connectée est refusée explicitement ; le navigateur ne peut pas revenir à un tirage client non sécurisé.

Pour vérifier le déploiement, l’URL suivante doit répondre autrement que `404 NOT_FOUND` :

```text
https://<project-ref>.supabase.co/functions/v1/open-booster
```

Si la commande CLI n’est pas installée, utilisez le dashboard Supabase : **Edge Functions → Deploy a new function**, créez `open-booster`, puis copiez le contenu de `supabase/functions/open-booster/index.ts` dans l’éditeur avant de déployer.
