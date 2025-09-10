import dotenv from 'dotenv';

dotenv.config();

export const config = {
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    apiSecret: process.env.BINANCE_API_SECRET || '',
    baseUrl: process.env.BINANCE_BASE_URL || 'https://api.binance.com'
  },
  db: {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || 'crypto_signals',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: process.env.PGSSLMODE || 'disable'
  },
  app: {
    logLevel: process.env.APP_LOG_LEVEL || 'info',
    timezone: process.env.APP_TIMEZONE || 'UTC'
  },
  backtest: {
    maxConcurrency: Number(process.env.BACKTEST_MAX_CONCURRENCY || 2)
  }
};

export default config;
