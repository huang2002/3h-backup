import process from 'node:process';
import { TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const TEST_FOLDER = 'manual';

cdTest();
await setFileStructure(TEST_ROOT_DIR, {
  [TEST_FOLDER]: {
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
      'update.txt': 'outdated',
    },
    backup: {
      'update.txt': 'outdated',
      'extra.txt': 'extra',
    },
  },
});

process.chdir(`./root/${TEST_FOLDER}`);

writeFileSync('./data/update.txt', 'updated');

execSync('node ../../../src/cli.js', {
  stdio: 'inherit',
});
