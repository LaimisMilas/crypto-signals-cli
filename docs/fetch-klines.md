# fetch:klines

Atsisiunčia OHLCV žvakes iš Binance ir įrašo į DB.

## Naudojimas
```bash
node bin/cs fetch:klines --symbol BTCUSDT [OPCIJOS]
```

## Opcijos
- `--symbol <symbol>` – privalomas; pora, pvz., `BTCUSDT`.
- `--from <time>` – pradžios laikas (ms arba ISO).
- `--to <time>` – pabaigos laikas (ms arba ISO).
- `--interval <interval>` – numatytas `1m`.
- `--fetch-limit <number>` – maksimalus žvakių kiekis per API skambutį (1000).
- `--resume` – tėsia nuo paskutinės įrašytos žvakės.
- `--server-time` – suderina laiką su Binance serveriu.
- Globalios: `--dry-run`, `--limit`, `--verbose`.

## Aktyvumo srautas
1. Išparsiuoja laikus ir prireikus juos pakoreguoja pagal serverio laiką.
2. Kartotinai kviečia Binance `/klines` API.
3. Įrašo gautas žvakes į `candles_<interval>` lentelę (nebent `--dry-run`).
4. Išveda surinktų žvakių skaičių.

