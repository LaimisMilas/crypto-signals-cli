export async function up(pgm) {
  pgm.alterColumn('signals', 'open_time', {
    type: 'timestamp',
    using: "to_timestamp(open_time / 1000) AT TIME ZONE 'Europe/Vilnius'",
  });
}

export async function down(pgm) {
  pgm.alterColumn('signals', 'open_time', {
    type: 'bigint',
    using: "(extract(epoch from open_time AT TIME ZONE 'Europe/Vilnius') * 1000)::bigint",
  });
}
