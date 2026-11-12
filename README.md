# free-cards-tcg-simulator
Simulateur personnel d’ouverture de boosters et de collection Pokémon TCG.

## Ouverture serveur

Les comptes connectés utilisent la fonction Supabase `open-booster`. Elle récupère le catalogue public Pokémon TCG côté serveur, applique les taux de drop (70 % rare classique, 20 % ultra rare, 10 % secret/SIR), puis exécute la mutation économique dans `open_boosters_internal`.

Après avoir exécuté l’intégralité du SQL affiché dans **Compte → SQL sécurité et économie serveur** (y compris le catalogue centralisé `catalog_pack_price` et les quêtes), déployez la fonction :

```powershell
supabase functions deploy open-booster
```

La fonction dispose automatiquement de `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY`. Elle utilise TCGdex avec la langue correcte (`en` ou `ja`) en priorité, l’API Pokémon TCG en secours et trois tentatives. Le catalogue serveur couvre les extensions proposées dans la boutique, dont les extensions XY et leurs identifiants TCGdex (`xy12`, `xy4`, `xy2`, `xy6`). Les sets japonais `M2a` et `M4`, ainsi que `30th Celebration`, ont leurs tailles de booster dédiées.

Les prix de boosters affichés et débités sont des prix fixes de simulation déclarés dans `SETS` de `index.html`. Ils ne dépendent plus d’un appel navigateur à TCGCSV, qui peut échouer sur GitHub Pages à cause de CORS. Le SQL `catalog_pack_price` est généré à partir de cette même liste ; après toute modification de prix ou ajout d’extension, réexécute le SQL depuis l’application et redéploie `open-booster` pour synchroniser la validation serveur. Tu peux ajouter `POKEMONTCG_API_KEY` dans les secrets Edge Functions pour augmenter la limite de l’API. Ne mets jamais une clé secrète dans `index.html`.

Tant que la fonction n’est pas déployée, une ouverture connectée est refusée explicitement ; le navigateur ne peut pas revenir à un tirage client non sécurisé.

Pour vérifier le déploiement, l’URL suivante doit répondre autrement que `404 NOT_FOUND` :

```text
https://<project-ref>.supabase.co/functions/v1/open-booster
```

Si la commande CLI n’est pas installée, utilisez le dashboard Supabase : **Edge Functions → Deploy a new function**, créez `open-booster`, puis copiez le contenu de `supabase/functions/open-booster/index.ts` dans l’éditeur avant de déployer.
