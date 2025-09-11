# compute:indicators

Apskaičiuoja techninius indikatorius konkrečiai porai ir intervalui.

## Naudojimas
```bash
node bin/cs compute:indicators --symbol BTCUSDT --interval 1m [OPCIJOS]
```

## Opcijos
- `--symbol <symbol>` – privalomas.
- `--interval <interval>` – privalomas.
- Globalios: `--dry-run`, `--limit`, `--verbose`.

## Aktyvumo srautas
1. Nuskaito žvakes iš `candles_<interval>` lentelės.
2. Slenkančiu būdu skaičiuoja RSI, ATR, Aroon, Bollinger, Trend, HH/LL.
3. Įrašo rezultatus į `indicators_<interval>` (nebent `--dry-run`).
4. Išveda apdorotų eilučių skaičių.

