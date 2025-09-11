# db:seed

Užpildo `symbols` lentelę pradiniais įrašais.

## Naudojimas
```bash
node bin/cs db:seed [OPCIJOS]
```

## Opcijos
- `--dry-run` – praleidžia seed’inimą.
- `--verbose` – detalesni logai.
- `--limit <n>` – globalus (nenaudojamas).

## Aktyvumo srautas
1. Paleidžia skriptą `scripts/seed-symbols.js`.
2. Įrašo simbolių sąrašą į DB.
3. Išveda „database seeded“.

