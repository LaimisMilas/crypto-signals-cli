import { Client } from 'pg';
import logger from '../src/utils/logger.js';

const symbols = ['BTCUSDT', 'SOLUSDT'];

const client = new Client();
await client.connect();
try {
  for (const symbol of symbols) {
    await client.query(
      'INSERT INTO symbols(symbol) VALUES ($1) ON CONFLICT (symbol) DO NOTHING',
      [symbol]
    );
  }
  logger.info(`seeded ${symbols.length} symbols`);
} finally {
  await client.end();
}

