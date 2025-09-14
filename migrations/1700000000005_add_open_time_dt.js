export async function up(pgm) {
  pgm.addColumn('signals', {
    open_time_dt: {
      type: 'timestamp',
      notNull: true,
      expressionGenerated: "to_timestamp(open_time / 1000) AT TIME ZONE 'Europe/Vilnius'",
    },
  });
}

export async function down(pgm) {
  pgm.dropColumn('signals', 'open_time_dt');
}
