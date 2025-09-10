import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

export async function dbInit() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const sqlPath = path.resolve(__dirname, '../../migrations/db.init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client();
  await client.connect();
  try {
    await client.query(sql);
    console.log('database initialized');
  } finally {
    await client.end();
  }
}

export async function dbMigrate() {
  await new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'migrate'], { stdio: 'inherit' });
    proc.on('close', code => (code === 0 ? resolve() : reject(new Error('migrate failed'))));
  });
}
