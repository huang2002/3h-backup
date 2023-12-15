import test from 'node:test';
import { TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import { DEFAULT_ENCODING, DEFAULT_LIST_FILES } from '../../src/config.js';
import assert from 'node:assert';
import { readListFile } from '../../src/readListFile.js';

const TEST_NAME = 'readListFile';
const CUSTOM_LIST_FILES = ['.my-backup-list', 'my-backup-list.txt'];

test(TEST_NAME, async () => {
  cdTest();

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_NAME]: {
      [DEFAULT_LIST_FILES[0]]: 'default\n',
      [CUSTOM_LIST_FILES[0]]: 'custom\n\n  \n# foo\n  # bar  \n0\n',
      [CUSTOM_LIST_FILES[1]]: 'custom-1\n',
      foo: {},
    },
  });

  process.chdir(TEST_ROOT_DIR);

  await Promise.all([
    test('no list file', async () => {
      assert.deepStrictEqual(
        await readListFile(
          `${TEST_NAME}/foo`,
          DEFAULT_LIST_FILES,
          DEFAULT_ENCODING,
        ),
        ['*'],
      );
    }),

    test('default list file', async () => {
      assert.deepStrictEqual(
        await readListFile(TEST_NAME, DEFAULT_LIST_FILES, DEFAULT_ENCODING),
        ['default'],
      );
    }),

    test('custom list file', async () => {
      assert.deepStrictEqual(
        await readListFile(TEST_NAME, CUSTOM_LIST_FILES, DEFAULT_ENCODING),
        ['custom', '0'],
      );
    }),
  ]);
});
