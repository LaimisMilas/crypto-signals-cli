export async function up(pgm) {
  pgm.noTransaction();

  // Add interval and strategy columns if missing.
  pgm.addColumn('signals', { interval: { type: 'text', notNull: true, default: '1m' } }, { ifNotExists: true });
  pgm.addColumn('signals', { strategy: { type: 'text', notNull: true, default: 'unknown' } }, { ifNotExists: true });

  // Remove defaults so future inserts must specify values explicitly.
  pgm.alterColumn('signals', 'interval', { default: null });
  pgm.alterColumn('signals', 'strategy', { default: null });

  // Remove any duplicates before enforcing uniqueness.
  pgm.sql(`
    WITH dups AS (
      SELECT id, ROW_NUMBER() OVER (
        PARTITION BY symbol, interval, open_time, strategy
        ORDER BY id DESC
      ) AS rn
      FROM signals
    )
    DELETE FROM signals
    USING dups
    WHERE signals.id = dups.id AND dups.rn > 1;
  `);

  // Drop old unique index if present.
  pgm.dropIndex('signals', ['symbol', 'open_time'], {
    name: 'signals_symbol_open_time_index',
    ifExists: true,
    concurrently: true,
  });

  // Create new unique index on (symbol, interval, open_time, strategy).
  pgm.createIndex('signals', ['symbol', 'interval', 'open_time', 'strategy'], {
    name: 'signals_symbol_interval_open_time_strategy_index',
    unique: true,
    ifNotExists: true,
    concurrently: true,
  });
}

export async function down(pgm) {
  pgm.noTransaction();

  pgm.dropIndex('signals', ['symbol', 'interval', 'open_time', 'strategy'], {
    name: 'signals_symbol_interval_open_time_strategy_index',
    ifExists: true,
    concurrently: true,
  });

  pgm.dropColumn('signals', 'interval', { ifExists: true });
  pgm.dropColumn('signals', 'strategy', { ifExists: true });

  pgm.createIndex('signals', ['symbol', 'open_time'], {
    unique: true,
    name: 'signals_symbol_open_time_index',
    ifNotExists: true,
    concurrently: true,
  });
}

