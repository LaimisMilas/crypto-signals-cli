export async function up(pgm) {
  pgm.addColumn('signals', {
    open_time_dt: {
      type: 'timestamp',
      notNull: true,
      expressionGenerated: "(CASE WHEN pg_typeof(open_time) = 'timestamp without time zone'::regtype THEN open_time ELSE to_timestamp(open_time / 1000.0) END) AT TIME ZONE 'Europe/Vilnius'",
    },
  });
}

export async function down(pgm) {
  pgm.dropColumn('signals', 'open_time_dt');
}
