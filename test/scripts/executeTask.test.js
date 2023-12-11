import test from 'node:test';
import {
  ENCODING,
  TEST_ROOT_DIR,
  cdTest,
  getFileStructure,
  setFileStructure,
} from './common.js';
import { executeTask } from '../../src/executeTask.js';
import process from 'node:process';
import path from 'node:path';
import assert from 'node:assert';

const TEST_NAME = 'executeTask';

test(TEST_NAME, async () => {
  cdTest();

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_NAME]: {
      src: {
        'file-1.txt': 'file-1_old',
        'file-2.txt': 'file-2_new',
        foo: {
          bar: {
            'baz.txt': 'baz_new',
          },
        },
      },
      dest: {
        'file-0.txt': 'file-0',
        'file-1.txt': 'file-1_new',
        'file-2.txt': 'file-2_old',
        blah: {
          'blah.txt': 'blah/blah',
        },
      },
    },
  });

  process.chdir(`${TEST_ROOT_DIR}/${TEST_NAME}`);

  await executeTask({
    name: 'my-task',
    sourcePath: path.resolve('src'),
    destinationPath: path.resolve('dest'),
    removeEmptyDirectory: true,
    fileList: [
      {
        source: path.resolve('src/file-0.txt'),
        destination: path.resolve('dest/file-0.txt'),
        action: 'remove',
      },
      {
        source: path.resolve('src/file-1.txt'),
        destination: path.resolve('dest/file-1.txt'),
        action: 'none',
      },
      {
        source: path.resolve('src/file-2.txt'),
        destination: path.resolve('dest/file-2.txt'),
        action: 'copy',
      },
      {
        source: path.resolve('src/foo/bar/baz.txt'),
        destination: path.resolve('dest/foo/bar/baz.txt'),
        action: 'copy',
      },
      {
        source: path.resolve('src/blah/blah.txt'),
        destination: path.resolve('dest/blah/blah.txt'),
        action: 'remove',
      },
    ],
  });

  const destinationStructure = await getFileStructure('dest', ENCODING);
  assert.deepStrictEqual(destinationStructure, {
    'file-1.txt': 'file-1_new',
    'file-2.txt': 'file-2_new',
    foo: {
      bar: {
        'baz.txt': 'baz_new',
      },
    },
  });
});
