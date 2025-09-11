# detect:patterns

Atpažįsta žvakių formacijas ir trend struktūrą.

## Naudojimas
```bash
node bin/cs detect:patterns --symbol BTCUSDT --interval 1m [OPCIJOS]
```

## Opcijos
- `--symbol <symbol>` – privalomas.
- `--interval <interval>` – privalomas.
- Globalios: `--dry-run`, `--limit`, `--verbose`.

## Aktyvumo srautas
1. Nuskaito žvakes iš `candles_<interval>`.
2. Tikrina bullish/bearish engulfing, hammer, shooting star.
3. Įrašo rezultatus į `patterns_<interval>` (nebent `--dry-run`).
4. Išveda logą „detect patterns“.

