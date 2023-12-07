import assert from 'node:assert';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('cli functionality', () => {
  execSync(`node ../src/cli.js -c ./root/backup-config.json`, {
    cwd: path.dirname(fileURLToPath(import.meta.url)),
  });
  assert(true);
});
