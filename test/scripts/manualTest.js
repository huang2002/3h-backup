import process from 'node:process';
import { TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import fs from 'node:fs/promises';
import { execSync } from 'node:child_process';

const TEST_NAME = 'manual';

cdTest();

await setFileStructure(TEST_ROOT_DIR, {
  [TEST_NAME]: {
    '3h-backup.json': JSON.stringify({
      skipConfirm: false,
      tasks: [
        {
          source: 'data',
          destination: 'backup',
          filter: 'union',
          replace: 'mtime',
        },
      ],
    }),

    data: {
      'new.txt': 'new',
      foo: {
        'update.txt': 'outdated',
      },
      'no-op.txt': 'no-op',
    },
    backup: {
      'extra.txt': 'extra',
    },
  },
});

process.chdir(`./root/${TEST_NAME}`);

await fs.copyFile('./data/no-op.txt', './backup/no-op.txt');
await fs.writeFile('./data/foo/update.txt', 'updated');

execSync('node ../../../src/cli.js', {
  stdio: 'inherit',
});
