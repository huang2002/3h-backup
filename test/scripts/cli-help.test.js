import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { test } from 'node:test';
import { cdTest } from './common.js';

test('cli-help', () => {
  cdTest();

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
      '  --help, -h               Show help info.',
      '  --config, -c <path>      The Path to the config file.',
      '                           Default: 3h-backup.json',
      '  --encoding, -e <enc>     The encoding of the config file and list files.',
      '                           Default: utf-8',
      '  --json, -j               Print tasks in json format.',
      '                           Default format: simple',
      '',
    ].join('\n'),
  );
});
