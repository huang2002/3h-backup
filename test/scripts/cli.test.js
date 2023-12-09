import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { test } from 'node:test';
import { existsSync, rmSync } from 'node:fs';
import { initTestDir } from './common.js';

test('cli help info', () => {
  initTestDir();

  const cliOutput = execSync('node ../src/cli.js --help', {
    encoding: 'utf-8',
  });
  assert.strictEqual(
    cliOutput,
    [
      'A personal backup helper.',
      '',
      'Usage:',
      '  3h-backup [options]',
      '',
      'Options:',
      '  --help, -h              Show help info.',
      '  --config, -c <path>     The Path to the config file.',
      '                          Default: 3h-backup.json',
      '',
    ].join('\n'),
  );
});

test.todo('cli functionality', () => {
  initTestDir();

  if (existsSync('./root/dest-1')) {
    rmSync('./root/dest-1', { recursive: true });
  }

  execSync('node ../src/cli.js -c ./root/backup-config.json');
});
