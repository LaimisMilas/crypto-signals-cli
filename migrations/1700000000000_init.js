export async function up(pgm) {
  pgm.createTable('symbols', {
    id: 'id',
    symbol: { type: 'text', notNull: true, unique: true }
  });

  pgm.createTable(
    'candles_1m',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      open: 'numeric',
      high: 'numeric',
      low: 'numeric',
      close: 'numeric',
      volume: 'numeric'
    },
    {
      constraints: { primaryKey: ['symbol', 'open_time'] }
    }
  );

  pgm.createTable(
    'candles_1h',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      open: 'numeric',
      high: 'numeric',
      low: 'numeric',
      close: 'numeric',
      volume: 'numeric'
    },
    {
      constraints: { primaryKey: ['symbol', 'open_time'] }
    }
  );

  pgm.createTable(
    'indicators_1m',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      data: { type: 'jsonb', notNull: true }
    },
    {
      constraints: { primaryKey: ['symbol', 'open_time'] }
    }
  );

  pgm.createTable(
    'indicators_1h',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      data: { type: 'jsonb', notNull: true }
    },
    {
      constraints: { primaryKey: ['symbol', 'open_time'] }
    }
  );

  pgm.createTable(
    'patterns_1m',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      bullish_engulfing: { type: 'boolean', notNull: true, default: false },
      bearish_engulfing: { type: 'boolean', notNull: true, default: false },
      hammer: { type: 'boolean', notNull: true, default: false },
      shooting_star: { type: 'boolean', notNull: true, default: false }
    },
    {
      constraints: { primaryKey: ['symbol', 'open_time'] }
    }
  );

  pgm.createTable(
    'patterns_1h',
    {
      symbol: { type: 'text', notNull: true },
      open_time: { type: 'bigint', notNull: true },
      bullish_engulfing: { type: 'boolean', notNull: true, default: false },
      bearish_engulfing: { type: 'boolean', notNull: true, default: false },
      hammer: { type: 'boolean', notNull: true, default: false },
      shooting_star: { type: 'boolean', notNull: true, default: false }
    },
    {
      constraints: { primaryKey: ['symbol', 'open_time'] }
    }
  );

  pgm.createTable('signals', {
    id: 'id',
    symbol: { type: 'text', notNull: true },
    open_time: { type: 'bigint', notNull: true },
    signal: { type: 'text', notNull: true }
  });

  pgm.createTable('trades_paper', {
    id: 'id',
    symbol: { type: 'text', notNull: true },
    open_time: { type: 'bigint', notNull: true },
    ts_close: { type: 'bigint' },
    side: { type: 'text' },
    qty: 'numeric',
    price: 'numeric',
    exit: 'numeric',
    pnl: 'numeric',
    status: 'text'
  });

  pgm.createTable('equity_paper', {
    ts: { type: 'bigint', primaryKey: true },
    equity: 'numeric',
    source: 'text',
    symbol: 'text'
  });

  pgm.createTable('jobs', {
    id: 'id',
    name: { type: 'text', notNull: true },
    run_at: { type: 'bigint' }
  });

  pgm.createIndex('signals', ['symbol', 'open_time'], { unique: true });
}

export async function down(pgm) {
  pgm.dropTable('jobs');
  pgm.dropTable('equity_paper');
  pgm.dropTable('trades_paper');
  pgm.dropTable('signals');
  pgm.dropTable('patterns_1h');
  pgm.dropTable('patterns_1m');
  pgm.dropTable('indicators_1h');
  pgm.dropTable('indicators_1m');
  pgm.dropTable('candles_1h');
  pgm.dropTable('candles_1m');
  pgm.dropTable('symbols');
}
