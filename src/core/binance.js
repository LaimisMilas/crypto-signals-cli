import fetch from 'node-fetch';
import { query } from '../storage/db.js';
import { insertCandles } from '../storage/repos/candles.js';

const BASE = process.env.BINANCE_API_URL || 'https://api.binance.com';
let lastCall = 0;
let serverDelta = 0;

export async function syncServerTime() {
  const url = new URL('/api/v3/time', BASE);
  const res = await fetch(url);
  if (!res.ok) throw new Error('binance error');
  const data = await res.json();
  serverDelta = data.serverTime - Date.now();
}

export function getServerTime() {
  return Date.now() + serverDelta;
}

async function rateLimit() {
  const now = getServerTime();
  const wait = 500 - (now - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = getServerTime();
}

async function fetchJson(url, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) throw new Error('rate limit');
      if (!res.ok) throw new Error('binance error');
      return res;
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, 500 * 2 ** i));
    }
  }
}

export async function fetchKlines({ symbol, interval, startMs, endMs, limit = 1000 }) {
  await rateLimit();
  const url = new URL('/api/v3/klines', BASE);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  if (startMs) url.searchParams.set('startTime', startMs);
  if (endMs) url.searchParams.set('endTime', endMs);
  url.searchParams.set('limit', limit);
  const res = await fetchJson(url);
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

function intervalToMs(interval) {
  const n = parseInt(interval.slice(0, -1));
  const unit = interval.slice(-1);
  const mult = { m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return n * mult;
}

export async function fetchKlinesRange({
  symbol,
  interval = '1m',
  startMs,
  endMs,
  limit = 1000,
  resume = false
}) {
  const step = intervalToMs(interval);
  let from = startMs;
  if (resume) {
    const jobRows = await query(
      `select max((params->>'endMs')::bigint) as m from jobs where type='fetch' and params->>'symbol'=$1 and params->>'interval'=$2`,
      [symbol, interval]
    );
    if (jobRows[0]?.m) {
      from = Number(jobRows[0].m) + step;
    } else {
      const rows = await query(`select max(open_time) as m from candles_${interval} where symbol=$1`, [symbol]);
      if (rows[0]?.m) from = Number(rows[0].m) + step;
    }
  }
  let total = 0;
  const batch = Math.min(limit, 1000);
  while (from === undefined || !endMs || from < endMs) {
    const data = await fetchKlines({ symbol, interval, startMs: from, endMs, limit: batch });
    if (data.length === 0) break;
    await insertCandles(symbol, data, interval);
    total += data.length;
    from = data[data.length - 1].openTime + step;
    if (data.length < batch) break;
    if (endMs && from >= endMs) break;
  }
  return total;
}
