# free-cards-tcg-simulator
Simulateur personnel d’ouverture de boosters et de collection Pokémon TCG.

## Ouverture serveur

Les comptes connectés utilisent la fonction Supabase `open-booster`. Elle récupère le catalogue public Pokémon TCG côté serveur, applique les taux de drop (70 % rare classique, 20 % ultra rare, 10 % secret/SIR), puis exécute la mutation économique dans `open_boosters_internal`.

Après avoir exécuté l’intégralité du SQL affiché dans **Compte → SQL sécurité et économie serveur** (y compris le catalogue centralisé `catalog_pack_price` et les quêtes), déployez la fonction :

```powershell
supabase functions deploy open-booster
```

La fonction dispose automatiquement de `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY`. Elle utilise TCGdex avec la langue correcte (`en` ou `ja`) en priorité, l’API Pokémon TCG en secours et trois tentatives. Les 117 extensions affichées dans la boutique sont couvertes côté serveur : extensions historiques, mini-sets et POP Series compris. Les sets japonais `M2a` et `M4`, `30th Celebration`, Double Crisis, Detective Pikachu et les POP Series ont leurs tailles de booster dédiées.

Les prix boutique sont des estimations USD par booster, arrondies au dollar ou au demi-dollar à partir des prix Market de boosters individuels TCGplayer agrégés par [TCGCSV](https://tcgcsv.com/tcgplayer/3/groups) (instantané consulté le 12 novembre 2026). Delta Reign est à 6,50 $ (prix Market observé : 6,34 $). Les produits japonais M2a et M4 ne sont pas cotés dans ce catalogue : leurs valeurs sont des estimations de prix d’import, pas des cotations observées. Les prix affichés et débités viennent de `SETS` dans `index.html` et ne dépendent pas d’un appel navigateur, qui pourrait échouer sur GitHub Pages à cause de CORS.

Le SQL `catalog_pack_price` et `catalog_pack_size` est généré depuis cette même liste ; après toute modification de prix ou ajout d’extension, réexécute le SQL depuis l’application et redéploie `open-booster` pour synchroniser la validation serveur. Les extensions de 2, 4, 5, 7 et 10 cartes sont gérées par la simulation, et le mode Hit Pile révèle les slots reverse et hit en laissant les communes dans le classeur. Tu peux ajouter `POKEMONTCG_API_KEY` dans les secrets Edge Functions pour augmenter la limite de l’API. Ne mets jamais une clé secrète dans `index.html`.

La vente des doublons connectés utilise `sell_duplicate_cards()` côté serveur pour traiter de grandes collections sans transmettre une liste limitée de clés depuis le navigateur. La vente manuelle accepte également une sélection jusqu’à la taille réelle du classeur. Après mise à jour, réexécute l’intégralité du SQL affiché dans **Compte → SQL sécurité et économie serveur** pour appliquer ces fonctions.

Tant que la fonction n’est pas déployée, une ouverture connectée est refusée explicitement ; le navigateur ne peut pas revenir à un tirage client non sécurisé.

Pour vérifier le déploiement, l’URL suivante doit répondre autrement que `404 NOT_FOUND` :

```text
https://<project-ref>.supabase.co/functions/v1/open-booster
```

Si la commande CLI n’est pas installée, utilisez le dashboard Supabase : **Edge Functions → Deploy a new function**, créez `open-booster`, puis copiez le contenu de `supabase/functions/open-booster/index.ts` dans l’éditeur avant de déployer.
