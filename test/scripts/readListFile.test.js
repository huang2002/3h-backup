import test from 'node:test';
import { TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import { DEFAULT_ENCODING, DEFAULT_LIST_FILES } from '../../src/config.js';
import assert from 'node:assert';
import { readListFile } from '../../src/readListFile.js';

test('readListFile', async () => {
  cdTest();

  const TEST_FOLDER = 'readListFile';
  const CUSTOM_LIST_FILES = ['.my-backup-list', 'my-backup-list.txt'];

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_FOLDER]: {
      [DEFAULT_LIST_FILES[0]]: 'default\n',
      [CUSTOM_LIST_FILES[0]]: 'custom-0\n',
      [CUSTOM_LIST_FILES[1]]: 'custom-1\n',
      foo: {},
    },
  });

  process.chdir(TEST_ROOT_DIR);

  assert.deepStrictEqual(
    await readListFile(TEST_FOLDER, DEFAULT_LIST_FILES, DEFAULT_ENCODING),
    ['default'],
  );

  assert.deepStrictEqual(
    await readListFile(
      `${TEST_FOLDER}/foo`,
      DEFAULT_LIST_FILES,
      DEFAULT_ENCODING,
    ),
    ['*'],
  );

  assert.deepStrictEqual(
    await readListFile(TEST_FOLDER, CUSTOM_LIST_FILES, DEFAULT_ENCODING),
    ['custom-0'],
  );
});
