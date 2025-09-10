import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadFixture(name) {
  const filePath = path.join(__dirname, '..', 'fixtures', `${name}.json`);
  return JSON.parse(readFileSync(filePath, 'utf8'));
}
