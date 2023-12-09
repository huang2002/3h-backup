import { execSync } from 'node:child_process';
import { test } from 'node:test';
import { existsSync, rmSync } from 'node:fs';
import { initTestDir } from './common.js';

// init files

test.todo('cli functionality', () => {
  initTestDir();

  if (existsSync('./root/dest-1')) {
    rmSync('./root/dest-1', { recursive: true });
  }

  execSync('node ../src/cli.js -c ./root/backup-config.json');
});
