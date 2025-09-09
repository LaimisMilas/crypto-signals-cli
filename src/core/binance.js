import fetch from 'node-fetch';
import { query } from '../storage/db.js';

const BASE = process.env.BINANCE_API_URL || 'https://api.binance.com';
let lastCall = 0;

async function rateLimit() {
  const now = Date.now();
  const wait = 500 - (now - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();
}

export async function fetchKlines({ symbol, interval, startMs, endMs, limit = 1000 }) {
  await rateLimit();
  const url = new URL('/api/v3/klines', BASE);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  if (startMs) url.searchParams.set('startTime', startMs);
  if (endMs) url.searchParams.set('endTime', endMs);
  url.searchParams.set('limit', limit);
  const res = await fetch(url);
  if (!res.ok) throw new Error('binance error');
  const data = await res.json();
  return data.map(k => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5])
  }));
}

export async function fetchKlinesResume({ symbol, interval = '1m' }) {
  const rows = await query('select max(open_time) as m from candles_1m where symbol=$1', [symbol]);
  const startMs = rows[0]?.m ? Number(rows[0].m) + 60000 : undefined;
  return fetchKlines({ symbol, interval, startMs });
}
