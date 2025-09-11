# jobs:list

Rodo paskutinius vykdytus darbus iš `jobs` lentelės.

## Naudojimas
```bash
node bin/cs jobs:list [--limit 10] [OPCIJOS]
```

## Opcijos
- `--limit <n>` – kiek įrašų rodyti; numatyta `10`.
- Globalios: `--dry-run`, `--verbose`.

## Aktyvumo srautas
1. Atlieka `select id, name, run_at from jobs order by run_at desc limit n`.
2. Išrašo kiekvieną eilutę į logus.
3. Grąžina sąrašą (naudinga programiniam naudojimui).

