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

