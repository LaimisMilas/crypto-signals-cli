# db:migrate

Vykdo „npm run migrate“ – paleidžia migracijas.

## Naudojimas
```bash
node bin/cs db:migrate [OPCIJOS]
```

## Opcijos
- `--dry-run` – praleidžia migraciją.
- `--verbose` – detalesni logai.
- `--limit <n>` – globalus (nenaudojamas).

## Aktyvumo srautas
1. Patikrina `--dry-run`.
2. Spawnina procesą `npm run migrate`.
3. Laukia proceso pabaigos ir praneša rezultatą.

## Nauja migracija
1. Sugeneruokite failą:
   ```bash
   npx node-pg-migrate create add-table --migrations-dir migrations
   ```
   Sukurs `migrations/<timestamp>_add-table.js`.
2. Redaguokite failą ir aprašykite `up`/`down` funkcijas naudojant `pgm` API:
   ```js
   export async function up(pgm) {
     pgm.createTable('table_name', { /* stulpeliai */ });
   }

   export async function down(pgm) {
     pgm.dropTable('table_name');
   }
   ```
3. Išsaugokite ir paleiskite migracijas komanda `node bin/cs db:migrate`.

