import { test } from 'node:test';
import {
  ENCODING,
  TEST_ROOT_DIR,
  cdTest,
  getFileStructure,
  setFileStructure,
} from './common.js';
import assert from 'node:assert';
import process from 'node:process';
import { rm, writeFile } from 'node:fs/promises';
import { executeBackup } from '../../src/executeBackup.js';

const TEST_NAME = 'executeBackup';

test(TEST_NAME, async () => {
  cdTest();

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_NAME]: {
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

  process.chdir(TEST_ROOT_DIR);

  const execBackup = () =>
    executeBackup({
      config: {
        skipConfirm: true,
        tasks: [
          {
            name: 't@5k',
            source: 'src',
            destination: 'dest',
            filter: 'union',
          },
          {
            source: 'src',
            destination: 'backup',
            filter: 'union',
          },
        ],
      },
      base: TEST_NAME,
      selectedTasks: ['t@5k'],
    });

  await test('initial backup', async () => {
    await execBackup();

    const destinationStructure = await getFileStructure(
      `./${TEST_NAME}/dest`,
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
  });

  await test('incremental backup', async () => {
    await writeFile(`./${TEST_NAME}/src/file-1.txt`, 'file-1_new');
    await writeFile(`./${TEST_NAME}/src/file-2.txt`, 'file-2_new');
    await rm(`./${TEST_NAME}/src/foo/bar/baz.txt`);
    await writeFile(`./${TEST_NAME}/dest/file-0.txt`, 'file-0_new');
    await rm(`./${TEST_NAME}/dest/foo/file-2.txt`);

    await execBackup();

    const newDestinationStructure = await getFileStructure(
      `./${TEST_NAME}/dest`,
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
});
