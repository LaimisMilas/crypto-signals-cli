# Crypto Signals CLI – Specifikacija

## Apžvalga
Lengvas CLI servisas Node.js, kuris:
- Atsisiunčia OHLCV žvakes iš Binance
- Išsaugo duomenis PostgreSQL
- Apskaičiuoja indikatorius (RSI, ATR, Aroon, Bollinger Bands)
- Atpažįsta pattern'us (bullish/bearish engulfing) ir trend struktūrą (HH/HL/LH/LL)
- Generuoja signalus pagal taisykles ir strategijas
- Palaiko backtest ir paprastą paper trading (equity kreivė, P&L)
- Valdomas tik terminalu (CLI), be UI
- MVP principas: viena sistema → duomenys → indikatoriai → signalai → backtest/paper

## Tech Stack
- Node.js (ESM): node >= 20
- PostgreSQL >= 14
- Binance REST API: klines
- Testai: Jest
- Lint/format: eslint, prettier
- Docker: docker compose (db + dev tools)
- Migracijos: node-pg-migrate (arba SQL + Flyway – pasirenkama)

## Konfigūracija
`.env`

```env
# Binance
BINANCE_API_KEY=
BINANCE_API_SECRET=
BINANCE_BASE_URL=https://api.binance.com

# DB
PGHOST=localhost
PGPORT=5432
PGDATABASE=crypto_signals
PGUSER=laimonas
PGPASSWORD=your_password
PGSSLMODE=disable

# App
APP_LOG_LEVEL=info
APP_TIMEZONE=UTC

# Backtest
BACKTEST_MAX_CONCURRENCY=2
```

API key ne visoms klines užklausoms būtinas, bet laikome laukus, kad ateityje būtų paprasta plėsti.

## DB schema

### Lentelės (MVP)

```sql
symbols(
  symbol text primary key,
  base text,
  quote text,
  is_active bool default true
);

candles_1m(
  id bigserial primary key,
  symbol text,
  ts timestamptz,
  open numeric,
  high numeric,
  low numeric,
  close numeric,
  volume numeric,
  unique(symbol, ts)
);

-- candles_1h(...) tas pats formatas, kitas intervalas

indicators_1m(
  id bigserial primary key,
  symbol text,
  ts timestamptz,
  rsi14 numeric,
  atr14 numeric,
  aroon_up25 numeric,
  aroon_down25 numeric,
  bb_mid20 numeric,
  bb_upper20_2 numeric,
  bb_lower20_2 numeric,
  trend text,   -- 'up'|'down'|'range'
  hhll text,    -- 'HH','HL','LH','LL','EQ','N/A'
  unique(symbol, ts)
);

patterns_1m(
  id bigserial primary key,
  symbol text,
  ts timestamptz,
  bullish_engulfing bool,
  bearish_engulfing bool,
  hammer bool,
  shooting_star bool,
  unique(symbol, ts)
);

signals(
  id bigserial primary key,
  symbol text,
  ts timestamptz,
  side text,
  reason jsonb,
  strategy text,
  confidence numeric default 1.0
);

trades_paper(
  id bigserial primary key,
  symbol text,
  ts_open timestamptz,
  ts_close timestamptz,
  side text,
  qty numeric,
  entry numeric,
  exit numeric,
  pnl numeric,
  status text
);

equity_paper(
  id bigserial primary key,
  ts timestamptz,
  equity numeric,
  source text
);

jobs(
  id bigserial primary key,
  name text,
  run_at bigint
);
```

Pastaba: indikatorius ir patternus kaupiame per intervalą. MVP – 1m; lengva pridėti 1h/4h dubliuojant lenteles arba su `interval` stulpeliu (bet indeksai paprasčiau kai atskiros lentelės).

### Indeksai

```sql
create index on candles_1m(symbol, ts);
create index on indicators_1m(symbol, ts);
create index on patterns_1m(symbol, ts);
create index on signals(symbol, ts);
```

## Duomenų srautas

- `fetch:klines` – traukia Binance žvakes (pvz., 1m) su `startTime`/`endTime` langais, laikosi rate-limit, tęsia nuo paskutinio ts DB.
- `compute:indicators` – transformuoja `candles_*` → `indicators_*`
- `detect:patterns` – žvakių formacijų aptikimas → `patterns_*`
- `signals:generate` – taisyklės (kombinuoja indikatorius + pattern + trend) → `signals`
- `backtest:run` – paleidžia strategiją istorijoje → `trades_paper`, `equity_paper`

## Indikatoriai (MVP)

- RSI(14): Wilder/standard
- ATR(14): `TR = max(H−L, |H−Cprev|, |L−Cprev|)`
- Aroon(25): up/down 0–100
- Bollinger(20, 2σ): middle = SMA20, upper/lower = ±2σ
- Trend (paprastas):
  - `trend='up'` kai close > BB_mid ir AroonUp > AroonDown + 20
  - `trend='down'` kai close < BB_mid ir AroonDown > AroonUp + 20
  - kitaip range
- HH/HL/LH/LL (swing struktūra):
  - Naudoti lokalinius swing high/low (pvz., 3–5 barų langas).
  - Palyginti paskutinius du swing high ir low:
    - naujas high > ankstesnis high → HH
    - naujas low > ankstesnis low → HL
    - naujas high < ankstesnis high → LH
    - naujas low < ankstesnis low → LL

## Pattern'ai (MVP)

- Bullish Engulfing: dabartinė žvakė „apgaubia“ ankstesnę su priešinga kryptimi
- Bearish Engulfing
- Hammer / Shooting Star: pagal wick/body santykius, lokali konfigūracija

## Signalų taisyklės (pavyzdžiai)

### Strategija: SidewaysReversal (MVP)

- BUY jei `trend='up'` ir `RSI14 < 40` ir `bullish_engulfing=true`
- SELL jei `(TP hit && trend='down') || RSI14 > 65 || bearish_engulfing=true`

### Strategija: BB-Revert

- BUY kai `close < bb_lower20_2` ir `AroonUp > 50`
- SELL kai `close > bb_upper20_2` arba `RSI14 > 70`

Taisyklės aprašomos JS faile arba YAML:

```yaml

name: SidewaysReversal
entry:
  side: buy
  all:
    - trend == "up"
    - rsi14 < 40
    - patterns.bullish_engulfing == true
exit:
  any:
    - tp_pct >= 1.5
    - trend == "down"
    - rsi14 > 65
    - patterns.bearish_engulfing == true
risk:
  sl_atr_mult: 1.5
  tp_atr_mult: 2.0
```

## CLI komandos

Bendras „namespace“: `cs` (bin script `./bin/cs`)

```bash
# DB inicializacija/migracijos
cs db:init              # sukuria DB, paleidžia migracijas
cs db:migrate           # vykdo naujas migracijas
cs db:seed              # įterpia simbolius ir pradinius įrašus

# Duomenys
cs fetch:klines --symbol SOLUSDT --interval 1m --from 2024-01-01 --to 2025-01-01
cs fetch:klines --symbol SOLUSDT --interval 1m --resume   # tęsia nuo paskutinio ts
cs resample --from 1m --to 1h --symbol SOLUSDT            # jei reikės agreguoti

# Indikatoriai / pattern'ai
cs compute:indicators --symbol SOLUSDT --interval 1m
cs detect:patterns --symbol SOLUSDT --interval 1m

# Signalai
cs signals:generate --strategy SidewaysReversal --symbol SOLUSDT --interval 1m --from 2025-01-01 --strategy-config '{"oversoldRsi":25}'

# Backtest / paper
cs backtest:run --strategy SidewaysReversal --symbol SOLUSDT --interval 1m --from 2025-06-01 --to 2025-09-01 --initial 10000 --strategy-config '{"oversoldRsi":25}'
cs paper:equity:snapshot --equity 10150 --source live

# Jobs
cs jobs:list --limit 20
cs jobs:run --type backtest --params '{"strategy":"SidewaysReversal","symbol":"SOLUSDT","from":"2025-06-01"}'
```

Visoms komandoms palaikyk `--dry-run`, `--limit`, `--verbose`.

## Kodo struktūra

```text
├─ bin/
│  └─ cs                      # CLI entry (#!/usr/bin/env node, ESM import)
├─ src/
│  ├─ config/                 # env, defaults
│  │  └─ index.js
│  ├─ storage/
│  │  ├─ db.js                # pg Pool, health checks
│  │  ├─ migrations/          # node-pg-migrate ar SQL
│  │  └─ repos/               # duomenų sluoksnis (candles, indicators, ...)
│  ├─ core/
│  │  ├─ binance.js           # klines fetch su rate-limit
│  │  ├─ indicators/
│  │  │  ├─ rsi.js, atr.js, aroon.js, bollinger.js
│  │  │  └─ trend.js, hhll.js
│  │  ├─ patterns/
│  │  │  └─ engulfing.js, hammer.js, star.js
│  │  ├─ signals/
│  │  │  ├─ engine.js         # taisyklių vykdymas
│  │  │  └─ strategies/
│  │  │     ├─ SidewaysReversal.js
│  │  │     └─ BBRevert.js
│  │  └─ backtest/
│  │     └─ runner.js         # PnL, TP/SL, equity, metrics
│  ├─ cli/
│  │  ├─ db.js
│  │  ├─ fetch.js
│  │  ├─ compute.js
│  │  ├─ patterns.js
│  │  ├─ signals.js
│  │  └─ backtest.js
│  └─ utils/
│     ├─ time.js
│     ├─ math.js              # SMA, EMA, STDEV, TrueRange, rolling windows
│     └─ logger.js
├─ test/                      # Jest
│  ├─ unit/
│  └─ integration/
├─ migrations/                # jei renkatės SQL + Flyway
├─ package.json
├─ docker-compose.yml
├─ Makefile
└─ README.md

```
## Binance integracija

- Endpoint: `/api/v3/klines?symbol=SOLUSDT&interval=1m&startTime=&endTime=&limit=1000`
- Skaidyti laiką langais (iki 1000 žvakių vienu ypu)
- Atstatymas po klaidos: saugoti paskutinį sėkmingą ts
- Laikrodis: naudoti server time (arba lokaliai UTC)
- Duomenų tikrumas: `unique(symbol, ts)` saugo nuo dublikatų

## Skaičiavimo detalės

- Rolling langai: naudokite efektyvius slenkančius skaičiavimus (ne recalcul nuo nulio)
- Naudingos utilės:
  - `SMA(N)`, `EMA(N)`, `STDEV(N)`, `TrueRange(high,low,prevClose)`
  - `ATR`
  - `AroonUp/Down(highs,lows,N)`
- Viską maršrutuoti per tranzakcijas arba „upsert“ (`on conflict do update`) – kad būtų idempotentiška

## Testavimas

- Unit testai: indicators, patterns, `signals.engine`
- Integraciniai: `fetch:klines` → DB įrašai; `backtest:run` → `trades` + `equity`
- Fixtures: mažas `SOLUSDT_1m_sample.json`

## Docker

```yaml

version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: crypto_signals
      POSTGRES_USER: laimonas
      POSTGRES_PASSWORD: your_password
    volumes:
      - ./_data/pg:/var/lib/postgresql/data
    ports: [ "5432:5432" ]
  adminer:
    image: adminer
    ports: [ "8080:8080" ]
```

Jei `initdb: directory exists but is not empty`, išvalyti `./_data/pg` arba naudoti kitą volume kelią.

## Backtest ir Paper Trading

- **Backtest**
  - Input: symbol, interval, from/to, strategy, initial_equity
  - Output: `trades_paper`, `equity_paper`, `metrics.json` (winrate, PF, maxDD, avgPnL, etc.)
  - TP/SL: pagal ATR multiplikatorius; palaikomas trailing SL (MVP – pastovus ATR k*)

- **Paper live**
  - Minimalus order simuliatorius pagal paskutinį close
  - Komanda `cs paper:equity:snapshot --equity 10150 --source live` leidžia ranka suvesti equity (pvz., iš kito šaltinio), kad matytum kreivę

## Logika ir klaidų valdymas

- Logger: pino arba winston, `APP_LOG_LEVEL`
- Grakštus „retry“ su backoff Binance klaidoms
- „Jobs“ lentelė sekti paleidimus/sėkmes/nesėkmes
- Idempotentiškos komandos (`--resume`, upsert)

## API (nebūtina, bet patogu)

- `GET /health`
- `GET /equity/paper?from=...` – kreivės JSON
- `GET /signals?symbol=&from=&strategy=`
- Bet MVP – viskas per CLI

## Projekto vizijos ryšys (Roadmap)

- Signalų generavimas – įgyvendintas (indikatoriai, trend, pattern, taisyklės)
- Backtest + optimizacija – backtest MVP + galima pridėti grid search vėliau
- Analytics – vietoje UI, duomenis galima išsiimti CSV/JSON ir braižyti vėliau
- Live monitoring – paper snapshot’ai
- Automatinė prekyba – ateityje (Binance/RevolutX order API)
- SaaS – ateityje (Stripe/Telegram)

## Artefaktai / eksportai

- `out/backtest/<strategy>_<symbol>_<interval>_<from>_<to>/`
  - `trades.csv`, `equity.csv`, `metrics.json`, `config.json`
- `out/signals/<strategy>_<symbol>_<interval>_<date>.csv`

## 
docs/crypto-signals-cli-spec.md ## Testavimas reikia patikrinti kas yra padaryta ir ko dar truksta sukurti uzduotis.