# signals:generate

Generuoja pirkimo/pardavimo signalus pagal pasirinktą strategiją.

## Naudojimas
```bash
node bin/cs signals:generate --symbol BTCUSDT --interval 1m \
  --strategy SidewaysReversal [OPCIJOS]
```

## Opcijos
- `--symbol <symbol>` – privalomas.
- `--interval <interval>` – privalomas.
- `--strategy <strategy>` – privalomas (`SidewaysReversal` arba `BBRevert`).
- Globalios: `--dry-run`, `--limit`, `--verbose`.

## Aktyvumo srautas
1. Nuskaito indikatorius ir žvakes iš DB.
2. Susieja su pattern’ais (`patterns_<interval>`).
3. Per `runStrategy` paleidžia strategiją kiekvienai žvakei.
4. Įrašo signalus į `signals` lentelę (nebent `--dry-run`).
5. Išveda sugeneruotų signalų skaičių.

