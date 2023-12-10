import test from 'node:test';
import { ENCODING, TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import assert from 'node:assert';
import { getBackupList } from '../../src/getBackupList.js';
import path from 'node:path';
import { DEFAULT_LIST_FILES } from '../../src/config.js';

const TEST_NAME = 'getBackupList';
const CUSTOM_LIST_FILES = [
  '.3h-backup-list',
  '3h-backup-list.txt',
  '.my-backup-list',
  'my-backup-list.txt',
];

test(TEST_NAME, async () => {
  cdTest();

  const commonFiles = {
    'file-0.txt': 'file-0',
    'file-1.txt': 'file-1',
    'file-2.txt': 'file-2',
    foo: {
      'bar.txt': 'foo/bar',
    },
  };

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_NAME]: {
      no_list_file: {
        ...commonFiles,
      },
      default_list_file: {
        [DEFAULT_LIST_FILES[0]]: 'file-2.txt\nfoo\n',
        ...commonFiles,
      },
      custom_list_file: {
        [CUSTOM_LIST_FILES[2]]: '*\n!file-1.txt\n!foo\n',
        [CUSTOM_LIST_FILES[3]]: '',
        ...commonFiles,
      },
    },
  });

  const TEST_FOLDER_PATH = path.join(TEST_ROOT_DIR, TEST_NAME);

  await test('no list file', async () => {
    assert.deepStrictEqual(
      await getBackupList('', {
        root: path.join(TEST_FOLDER_PATH, 'no_list_file'),
        listFiles: DEFAULT_LIST_FILES,
        encoding: ENCODING,
      }),
      ['file-0.txt', 'file-1.txt', 'file-2.txt', 'foo/bar.txt'],
    );
  });

  await test('default list file', async () => {
    assert.deepStrictEqual(
      await getBackupList('', {
        root: path.join(TEST_FOLDER_PATH, 'default_list_file'),
        listFiles: DEFAULT_LIST_FILES,
        encoding: ENCODING,
      }),
      ['file-2.txt', 'foo/bar.txt'],
    );
  });

  await test('custom list file', async () => {
    assert.deepStrictEqual(
      await getBackupList('', {
        root: path.join(TEST_FOLDER_PATH, 'custom_list_file'),
        listFiles: CUSTOM_LIST_FILES,
        encoding: ENCODING,
      }),
      ['file-0.txt', 'file-2.txt', CUSTOM_LIST_FILES[3]],
    );
  });
});
