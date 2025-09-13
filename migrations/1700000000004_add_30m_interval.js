export async function up(pgm) {
  pgm.createTable(
    'candles_30m',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      open: 'numeric',
      high: 'numeric',
      low: 'numeric',
      close: 'numeric',
      volume: 'numeric'
    },
    { constraints: { primaryKey: ['symbol', 'open_time'] } }
  );

  pgm.createTable(
    'indicators_30m',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      data: { type: 'jsonb', notNull: true }
    },
    { constraints: { primaryKey: ['symbol', 'open_time'] } }
  );

  pgm.createTable(
    'patterns_30m',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      bullish_engulfing: { type: 'boolean', notNull: true, default: false },
      bearish_engulfing: { type: 'boolean', notNull: true, default: false },
      hammer: { type: 'boolean', notNull: true, default: false },
      shooting_star: { type: 'boolean', notNull: true, default: false }
    },
    { constraints: { primaryKey: ['symbol', 'open_time'] } }
  );
}

export async function down(pgm) {
  pgm.dropTable('patterns_30m');
  pgm.dropTable('indicators_30m');
  pgm.dropTable('candles_30m');
}
