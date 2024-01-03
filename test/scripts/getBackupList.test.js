import test from 'node:test';
import { ENCODING, TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import assert from 'node:assert';
import path from 'node:path';
import process from 'node:process';
import {
  DEFAULT_FILTER,
  DEFAULT_LIST_FILES,
  DEFAULT_REPLACE,
} from '../../src/config.js';
import { getBackupList } from '../../src/getBackupList.js';

const TEST_NAME = 'getBackupList';
const CUSTOM_FILTER = 'union';
const CUSTOM_REPLACE = 'ctime';
const CUSTOM_LIST_FILES = ['my-backup-list.txt'];

test(TEST_NAME, async () => {
  cdTest();

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_NAME]: {
      src: {
        [DEFAULT_LIST_FILES[0]]: 'file-2.txt\n',
        [CUSTOM_LIST_FILES[0]]: 'foo\n',
        'file-0.txt': 'file-0',
        'file-1.txt': 'file-1',
        'file-2.txt': 'file-2',
        foo: {
          'bar.txt': 'foo/bar',
        },
      },
    },
  });

  await setFileStructure(path.join(TEST_ROOT_DIR, TEST_NAME), {
    dest: {
      'file-2.txt': 'file-2',
    },
  });

  const TEST_FOLDER_PATH = path.join(TEST_ROOT_DIR, TEST_NAME);
  process.chdir(TEST_FOLDER_PATH);

  await Promise.all([
    test('default', async () => {
      assert.deepStrictEqual(
        await getBackupList({
          sourcePath: 'src',
          destinationPath: 'dest',
          listFiles: DEFAULT_LIST_FILES,
          encoding: ENCODING,
          filter: DEFAULT_FILTER,
          replace: DEFAULT_REPLACE,
        }),
        ['file-2.txt'],
      );
    }),

    test('custom', async () => {
      assert.deepStrictEqual(
        await getBackupList({
          sourcePath: 'src',
          destinationPath: 'dest',
          listFiles: CUSTOM_LIST_FILES,
          encoding: ENCODING,
          filter: CUSTOM_FILTER,
          replace: CUSTOM_REPLACE,
        }),
        ['file-2.txt', path.join('foo', 'bar.txt')],
      );
    }),
  ]);
});
