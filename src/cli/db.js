import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';
import logger from '../utils/logger.js';

export async function dbInit({ dryRun } = {}) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const sqlPath = path.resolve(__dirname, '../../migrations/db.init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  if (dryRun) {
    logger.info('dry-run: skip database initialization');
    return;
  }
  const client = new Client();
  await client.connect();
  try {
    await client.query(sql);
    logger.info('database initialized');
  } finally {
    await client.end();
  }
}

export async function dbMigrate({ dryRun } = {}) {
  if (dryRun) {
    logger.info('dry-run: skip db migrate');
    return;
  }
  await new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'migrate'], { stdio: 'inherit' });
    proc.on('close', code => (code === 0 ? resolve() : reject(new Error('migrate failed'))));
  });
}

export async function dbSeed({ dryRun } = {}) {
  if (dryRun) {
    logger.info('dry-run: skip db seed');
    return;
  }
  await new Promise((resolve, reject) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const script = path.resolve(__dirname, '../../scripts/seed-symbols.js');
    const proc = spawn('node', [script], { stdio: 'inherit' });
    proc.on('close', code => (code === 0 ? resolve() : reject(new Error('seed failed'))));
  });
}
