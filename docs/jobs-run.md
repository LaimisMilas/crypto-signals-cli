# jobs:run

Paleidžia suplanuotą darbą pagal tipą (pvz., `backtest`).

## Naudojimas
```bash
node bin/cs jobs:run --type backtest --params '{"symbol":"BTCUSDT",...}' [OPCIJOS]
```

## Opcijos
- `--type <type>` – privalomas; šiuo metu palaikomas `backtest`.
- `--params <json>` – JSON parametrai konkrečiam darbui.
- Globalios: `--dry-run`, `--limit`, `--verbose`.

## Aktyvumo srautas
1. Parenka `handler` pagal `type`.
2. `JSON.parse` ant `--params`.
3. Paleidžia atitinkamą funkciją (pvz., `backtestRun`).
4. Atnaujina `jobs` lentelę `run_at` lauku.
5. Išveda „job <type> completed“.

