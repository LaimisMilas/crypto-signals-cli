# db:init

Inicializuoja duomenų bazę naudojant SQL skriptą `migrations/db.init.sql`.

## Naudojimas
```bash
node bin/cs db:init [OPCIJOS]
```

## Opcijos
- `--dry-run` – neveikia DB, tik parodo pranešimą.
- `--verbose` – detalesni logai.
- `--limit <n>` – globalus (čia nenaudojamas).

## Aktyvumo srautas
1. Perskaito `migrations/db.init.sql`.
2. Prisijungia prie PostgreSQL.
3. Vykdo skriptą.
4. Išveda „database initialized“.

