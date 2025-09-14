export async function up(pgm) {
  pgm.dropTable('signals', { ifExists: true });
  pgm.createTable('signals', {
    id: 'id',
    symbol: { type: 'text', notNull: true },
    open_time: { type: 'timestamp', notNull: true },
    interval: { type: 'text', notNull: true },
    strategy: { type: 'text', notNull: true },
    signal: { type: 'text', notNull: true },
  });
  pgm.createIndex('signals', ['symbol', 'interval', 'open_time', 'strategy'], {
    name: 'signals_symbol_interval_open_time_strategy_index',
    unique: true,
    ifNotExists: true,
  });
}

export async function down(pgm) {
  pgm.dropIndex('signals', ['symbol', 'interval', 'open_time', 'strategy'], {
    name: 'signals_symbol_interval_open_time_strategy_index',
    ifExists: true,
  });
  pgm.dropTable('signals', { ifExists: true });
  pgm.createTable('signals', {
    id: 'id',
    symbol: { type: 'text', notNull: true },
    open_time: { type: 'bigint', notNull: true },
    signal: { type: 'text', notNull: true },
  });
  pgm.createIndex('signals', ['symbol', 'open_time'], {
    name: 'signals_symbol_open_time_index',
    unique: true,
    ifNotExists: true,
  });
}
