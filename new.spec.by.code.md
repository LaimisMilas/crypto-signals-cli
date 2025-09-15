# Crypto Signals CLI specifikacija

Ši specifikacija sugeneruota analizuojant projekto kodą.

## Komanda `cs`
CLI programą sudaro komanda `cs` su globaliomis parinktimis `--dry-run`, `--limit` ir `--verbose`. Pagrindinės vidinės komandos:

- `db:init`, `db:migrate`, `db:seed` – duomenų bazės inicijavimas, migracijos ir sėklavimas.
- `fetch:klines` – atsisiunčia žvakių duomenis iš Binance su pasirinktu simboliu ir intervalu.
- `compute:indicators` – apskaičiuoja techninius indikatorius (RSI, ATR, Aroon, Bollinger, trend, HH/LL) ir išsaugo rezultatus.
- `detect:patterns` – aptinka žvakių modelius (bullish/bearish engulfing, hammer, shooting star).
- `resample` – agreguoja žvakes iš vieno intervalo į kitą.
- `backtest:run` – vykdo strategijos atgalinį testavimą, generuoja ataskaitas ir rezultatus.
- `signals:generate` – generuoja prekybos signalus pagal pasirinktą strategiją.
- `paper:equity:snapshot` – įrašo momentinį balanso vaizdą popierinei sąskaitai.
- `jobs:list` ir `jobs:run` – darbų sąrašo peržiūra ir vykdymas.

## Strategijos ir signalai
Yra įgyvendintos dvi strategijos: `BBRevert` ir `SidewaysReversal`. Strategijų variklis vykdo taisyklių rinkinį arba `entry/exit` funkcijas ir grąžina signalą `buy` arba `sell`.

## Indikatorių ir modelių skaičiavimas
- Indikatoriai: RSI, ATR, Aroon, Bollinger juostos, trend ir HH/LL.
- Modeliai: bullish/bearish engulfing, hammer ir shooting star.

## Backtest ir popierinė prekyba
- `runBacktest` skaičiuoja laimėjimų procentą, pelno/failo santykį, maksimalų nuosmukį ir vidutinį PnL; palaiko ATR pagrįstus SL/TP lygius ir vykdo tik long sandorius.
- `LiveSimulator` leidžia atlikti žingsninę popierinę prekybą naudojant gautus signalus.

## Duomenų bazės struktūra
Pagrindinės lentelės:
- `symbols` – saugo prekybos simbolius.
- `candles_1m`, `candles_1h` – 1 minutės ir 1 valandos žvakės.
- `indicators_1m`, `indicators_1h` – indikatoriai JSON formatu.
- `patterns_1m`, `patterns_1h` – žvakių modeliai.
- `signals` – generuoti signalai.
- `trades_paper` ir `equity_paper` – popierinės prekybos rezultatai.
- `jobs` – vykdomų darbų istorija.

## Naudingos pagalbinės funkcijos
Projekte naudojamos utilitarinės funkcijos `retry` (pakartotiniai bandymai), `math` (matematinės operacijos ir slenkančių langų klasė), `time` (laiko konvertavimas) ir `logger` (pino žurnalai).

