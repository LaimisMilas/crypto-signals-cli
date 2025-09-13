# Pridėti naują žvakių intervalą

Šiame pavyzdyje pridedame 30 minučių (`30m`) intervalą.

## 1. Lentelės duomenų bazėje
Sukurkite migraciją ir pridėkite lenteles `candles_30m`, `indicators_30m`, `patterns_30m`.
Pavyzdys yra faile `migrations/1700000000004_add_30m_interval.js`.

Paleiskite migracijas:
```bash
node bin/cs db:migrate
```

## 2. Užpildykite žvakes
Jei turite 1m žvakes, galite agreguoti jas į 30m:
```bash
node bin/cs resample --symbol BTCUSDT --from 1m --to 30m
```

## 3. Apskaičiuokite indikatorius ir patternus
```bash
node bin/cs compute:indicators --symbol BTCUSDT --interval 30m
node bin/cs detect:patterns --symbol BTCUSDT --interval 30m
```

Po šių žingsnių `--interval 30m` veiks visose komandose, pvz.:
```bash
node bin/cs signals:generate --symbol BTCUSDT --interval 30m --strategy SidewaysReversal
```
