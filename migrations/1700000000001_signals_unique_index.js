export async function up(pgm) {
  pgm.createIndex('signals', ['symbol', 'open_time'], {
    unique: true,
    name: 'signals_symbol_open_time_index',
  });
}

export async function down(pgm) {
  pgm.dropIndex('signals', ['symbol', 'open_time'], {
    name: 'signals_symbol_open_time_index',
  });
}
