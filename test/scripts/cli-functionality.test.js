import { test } from 'node:test';
import {
  ENCODING,
  TEST_ROOT_DIR,
  cdTest,
  execAsync,
  getFileStructure,
  setFileStructure,
} from './common.js';
import assert from 'node:assert';
import { rm, writeFile } from 'node:fs/promises';

test('cli functionality', async () => {
  cdTest();

  const TEST_FOLDER = 'cli-functionality';

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_FOLDER]: {
      'backup-config.json': JSON.stringify({
        skipConfirm: true,
        tasks: [
          {
            source: 'src',
            destination: 'dest',
            filter: 'union',
          },
        ],
      }),

      src: {
        'file-0.txt': 'file-0',
        'file-1.txt': 'file-1',
        'file-2.txt': 'file-2',
        '.3h-backup-list': '*\n!file-[0,1].*\n!temp\n',
        foo: {
          '.3h-backup-list': 'bar\nfile-2.txt\n',
          'file-0.txt': 'foo/file-0',
          'file-1.txt': 'foo/file-1',
          'file-2.txt': 'foo/file-2',
          bar: {
            'baz.txt': 'foo/bar/baz',
          },
        },
        temp: {
          'temp.txt': 'temp/temp',
        },
      },
    },
  });

  await execAsync('node', [
    '../src/cli.js',
    '-c',
    `./root/${TEST_FOLDER}/backup-config.json`,
  ]);

  const destinationStructure = await getFileStructure(
    `./root/${TEST_FOLDER}/dest`,
    ENCODING,
  );
  assert.deepStrictEqual(destinationStructure, {
    'file-2.txt': 'file-2',
    foo: {
      'file-2.txt': 'foo/file-2',
      bar: {
        'baz.txt': 'foo/bar/baz',
      },
    },
  });

  await writeFile(`./root/${TEST_FOLDER}/src/file-1.txt`, 'file-1_new');
  await writeFile(`./root/${TEST_FOLDER}/src/file-2.txt`, 'file-2_new');
  await rm(`./root/${TEST_FOLDER}/src/foo/bar/baz.txt`);
  await writeFile(`./root/${TEST_FOLDER}/dest/file-0.txt`, 'file-0_new');
  await rm(`./root/${TEST_FOLDER}/dest/foo/file-2.txt`);

  await execAsync('node', [
    '../src/cli.js',
    '-c',
    `./root/${TEST_FOLDER}/backup-config.json`,
  ]);

  const newDestinationStructure = await getFileStructure(
    `./root/${TEST_FOLDER}/dest`,
    ENCODING,
  );
  assert.deepStrictEqual(newDestinationStructure, {
    'file-0.txt': 'file-0_new',
    'file-2.txt': 'file-2_new',
    foo: {
      'file-2.txt': 'foo/file-2',
    },
  });
});
