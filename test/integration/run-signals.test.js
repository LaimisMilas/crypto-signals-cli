import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const envPath = path.join(repoRoot, '.env');

let envBackupPath;
let stubDir;
let stubLogPath;

beforeAll(() => {
  if (existsSync(envPath)) {
    envBackupPath = path.join(
      repoRoot,
      `.env.test-backup-${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
    renameSync(envPath, envBackupPath);
  }

  writeFileSync(envPath, '\n', 'utf8');

  stubDir = mkdtempSync(path.join(tmpdir(), 'node-stub-'));
  const stubScriptPath = path.join(stubDir, 'node');
  stubLogPath = path.join(stubDir, 'invocations.log');
  writeFileSync(stubLogPath, '', 'utf8');
  writeFileSync(
    stubScriptPath,
    `#!/usr/bin/env bash
set -euo pipefail
if [[ -z "\${NODE_STUB_LOG:-}" ]]; then
  echo "NODE_STUB_LOG not set" >&2
  exit 1
fi
printf '%s\\n' "$*" >> "$NODE_STUB_LOG"
exit 0
`
  );
  chmodSync(stubScriptPath, 0o755);
});

afterAll(() => {
  if (existsSync(envPath)) {
    unlinkSync(envPath);
  }
  if (envBackupPath && existsSync(envBackupPath)) {
    renameSync(envBackupPath, envPath);
  }
  if (stubDir && existsSync(stubDir)) {
    rmSync(stubDir, { recursive: true, force: true });
  }
});

describe('run-signals script', () => {
  it('propagates interval overrides to all steps', () => {
    const result = spawnSync(path.join(repoRoot, 'scripts/run-signals.sh'), {
      cwd: repoRoot,
      env: {
        ...process.env,
        PATH: `${stubDir}:${process.env.PATH ?? ''}`,
        NODE_STUB_LOG: stubLogPath,
        INTERVAL: '30m',
        SYMBOLS: 'BTCUSDT',
        STRATEGY: 'dummy-strategy',
      },
      encoding: 'utf8',
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);

    const logContents = readFileSync(stubLogPath, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const expectedSteps = [
      'fetch:klines',
      'compute:indicators',
      'detect:patterns',
      'signals:generate',
    ];

    expect(logContents).toHaveLength(expectedSteps.length);

    expectedSteps.forEach((step, index) => {
      expect(logContents[index]).toContain(step);
      expect(logContents[index]).toContain('--interval 30m');
    });
  });
});
