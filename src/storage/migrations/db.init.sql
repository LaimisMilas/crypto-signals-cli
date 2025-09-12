-- Database initialization script
-- Creates core tables and indexes for crypto-signals-cli

create table if not exists symbols (
  symbol text primary key,
  base text,
  quote text,
  is_active boolean default true
);

create table if not exists candles_1m (
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

create table if not exists candles_1h (
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

create table if not exists indicators_1m (
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
  trend text,
  hhll text,
  unique(symbol, ts)
);

create table if not exists indicators_1h (
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
  trend text,
  hhll text,
  unique(symbol, ts)
);

create table if not exists patterns_1m (
  id bigserial primary key,
  symbol text,
  ts timestamptz,
  bullish_engulfing boolean not null default false,
  bearish_engulfing boolean not null default false,
  hammer boolean not null default false,
  shooting_star boolean not null default false,
  unique(symbol, ts)
);

create table if not exists patterns_1h (
  id bigserial primary key,
  symbol text,
  ts timestamptz,
  bullish_engulfing boolean not null default false,
  bearish_engulfing boolean not null default false,
  hammer boolean not null default false,
  shooting_star boolean not null default false,
  unique(symbol, ts)
);

create table if not exists signals (
  id bigserial primary key,
  symbol text,
  ts timestamptz,
  side text,
  reason jsonb,
  strategy text,
  confidence numeric default 1.0
);

create table if not exists trades_paper (
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

create table if not exists equity_paper (
  id bigserial primary key,
  ts timestamptz,
  equity numeric,
  source text
);

create table if not exists jobs (
  id bigserial primary key,
  type text,
  params jsonb,
  status text,
  started_at timestamptz,
  finished_at timestamptz,
  error text
);

create index if not exists idx_candles_1m_symbol_ts on candles_1m(symbol, ts);
create index if not exists idx_candles_1h_symbol_ts on candles_1h(symbol, ts);
create index if not exists idx_indicators_1m_symbol_ts on indicators_1m(symbol, ts);
create index if not exists idx_indicators_1h_symbol_ts on indicators_1h(symbol, ts);
create index if not exists idx_patterns_1m_symbol_ts on patterns_1m(symbol, ts);
create index if not exists idx_patterns_1h_symbol_ts on patterns_1h(symbol, ts);
create index if not exists idx_signals_symbol_ts on signals(symbol, ts);
