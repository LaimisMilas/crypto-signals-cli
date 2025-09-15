# backtest:run

Paleidžia pasirinktos strategijos backtestą pagal istorines žvakes ir signalus.

## Naudojimas
```bash
node bin/cs backtest:run --strategy SidewaysReversal --symbol BTCUSDT \
  --interval 1m --from 1700000000000 --to 1700003600000 --initial 1000 \
  --strategy-config '{"oversoldRsi":25}' [OPCIJOS]
```

## Opcijos
- `--strategy <strategy>` – privalomas; šiuo metu `SidewaysReversal` arba `BBRevert`.
- `--symbol <symbol>` – privalomas.
- `--interval <interval>` – privalomas.
- `--from <ms>` / `--to <ms>` – laikų rėžiai.
- `--initial <sum>` – pradinė balanso suma.
- `--strategy-config <json>` – papildoma strategijos konfigūracija.
- Globalios: `--dry-run`, `--limit`, `--verbose`.

## Aktyvumo srautas
1. Krauna žvakes iš DB (arba iš failo, jei perduota per `--candles` – kodu).
2. Krauna signalus (jei nėra, generuoja iš DB).
3. Vykdo `runBacktest`, gaudamas `trades`, `equity`, `metrics`.
4. Įrašo `trades_paper` ir `equity_paper` (nebent `--dry-run`).
5. Sugeneruoja `out/backtest/<...>/` aplanką su CSV/JSON rezultatais.
6. Išveda „backtest completed“.

## Pastabos
- Prieš paleidžiant reikia išvalyti db lentele `trades_paper`
- Backtestas palaiko tik long sandorius; `sell` signalai uždaro atvirą poziciją ir neatidaro `short`

## Failai

cs backtest:run kiekvieną kartą sukuria aplanką out/backtest/<strategija>_<porą>_<intervalas>_<from>_<to>/, kuriame yra keli failai. Jie padeda įsivertinti strategijos rezultatus:

config.json
Saugomi visi paleidimo parametrai: strategijos pavadinimas, simbolis, intervalas, pradinė suma, mokesčių dydis ir t. t.
Naudinga dalinantis ar atkuriant identišką backtestą vėliau.

trades.csv
Detalus kiekvieno sandorio sąrašas: įėjimo/išėjimo laikas, kryptis („buy“/„sell“), kaina, kiekis, P&L.
Analizuokite skaičiuoklėje ar su pandas, kad matytumėte, kur strategija įeina/išeina ir kiek uždirbo prarado.

equity.csv
Balanso kreivė laikui bėgant.
Puikiai tinka brėžti grafiką ir matyti, kaip kito sąskaitos vertė (galima skaičiuoti „drawdown“, lyginti kelias strategijas).

metrics.json
Agreguoti rodikliai: galutinis pelnas, ROI, „win rate“, maksimalus nuosmukis ir t. t.
Tai greitas santraukos failas, kurį galite importuoti į kitus įrankius ar naudoti lyginant skirtingų testų rezultatus.
Kur naudoti?
Strategijų palyginimas: generuodami kelis backtestus su skirtingais parametrais ar strategijomis, galite palyginti metrics.json reikšmes.
Grafikai ir ataskaitos: equity.csv bei trades.csv leidžia sukurti ataskaitas ar vizualizacijas (pvz., balanso kreivę, pelningų/nuostolingų sandorių pasiskirstymą).
Tolesnė optimizacija: remdamiesi gautais rodikliais, galite keisti parametrus, filtruoti sandorius ar plėtoti naujas strategijas.
