create table if not exists pgmigrations
(
    id     serial
        primary key,
    name   varchar(255) not null,
    run_on timestamp    not null
);

alter table pgmigrations
    owner to laimonas;

create table if not exists symbols
(
    id     serial
        primary key,
    symbol text not null
        unique
);

alter table symbols
    owner to laimonas;

create table if not exists candles_1m
(
    symbol    text   not null,
    open_time bigint not null,
    open      numeric,
    high      numeric,
    low       numeric,
    close     numeric,
    volume    numeric,
    primary key (symbol, open_time)
);

alter table candles_1m
    owner to laimonas;

create table if not exists indicators_1m
(
    symbol    text   not null,
    open_time bigint not null,
    data      jsonb  not null,
    primary key (symbol, open_time)
);

alter table indicators_1m
    owner to laimonas;

create table if not exists patterns_1m
(
    symbol    text   not null,
    open_time bigint not null,
    bullish_engulfing boolean not null default false,
    bearish_engulfing boolean not null default false,
    hammer boolean not null default false,
    shooting_star boolean not null default false,
    primary key (symbol, open_time)
);

alter table patterns_1m
    owner to laimonas;

create table if not exists signals
(
    id        serial
        primary key,
    symbol    text   not null,
    open_time bigint not null,
    signal    text   not null
);

alter table signals
    owner to laimonas;

create index if not exists signals_symbol_open_time_index
    on signals (symbol, open_time);

create table if not exists trades_paper
(
    id        serial
        primary key,
    symbol    text   not null,
    open_time bigint not null,
    qty       numeric,
    price     numeric
);

alter table trades_paper
    owner to laimonas;

create table if not exists equity_paper
(
    ts     bigint not null
        primary key,
    equity numeric
);

alter table equity_paper
    owner to laimonas;

create table if not exists jobs
(
    id     serial
        primary key,
    name   text not null,
    run_at bigint
);

alter table jobs
    owner to laimonas;

