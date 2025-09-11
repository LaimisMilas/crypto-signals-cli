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

