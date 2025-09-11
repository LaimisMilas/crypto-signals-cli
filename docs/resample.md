# resample

Perrašo žvakes iš vieno intervalo į kitą (pvz., 1m → 5m).

## Naudojimas
```bash
node bin/cs resample --from 1m --to 5m --symbol BTCUSDT [OPCIJOS]
```

## Opcijos
- `--from <interval>` – privalomas, pradinio intervalo ilgis.
- `--to <interval>` – privalomas, tikslo intervalas.
- `--symbol <symbol>` – privalomas.
- Globalios: `--dry-run`, `--limit`, `--verbose`.

## Aktyvumo srautas
1. Paverčia intervalus į milisekundes ir patikrina, ar `to` yra `from` daugiklis.
2. Grupuoja šaltinio žvakes į naujus “bucket’us“.
3. Apskaičiuoja naujas atidarymo/uždarymo/high/low/volume reikšmes.
4. Įrašo į `candles_<to>` (nebent `--dry-run`).
5. Išveda resamplintų žvakių kiekį.

