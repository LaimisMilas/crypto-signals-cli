import { spawn } from 'child_process';

export async function dbMigrate() {
  await new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'migrate'], { stdio: 'inherit' });
    proc.on('close', code => (code === 0 ? resolve() : reject(new Error('migrate failed'))));
  });
}
