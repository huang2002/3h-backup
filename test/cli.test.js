import assert from 'node:assert';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

test('cli functionality', () => {
  process.chdir(path.dirname(fileURLToPath(import.meta.url)));
  execSync('node ../src/cli.js -c ./root/backup-config.json');
  // TODO:
  assert(false, 'unimplemented');
});
