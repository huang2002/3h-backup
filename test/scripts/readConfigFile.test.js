import test from 'node:test';
import { TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import { DEFAULT_CONFIG_FILE, DEFAULT_ENCODING } from '../../src/config.js';
import assert from 'node:assert';
import { readConfigFile } from '../../src/readConfigFile.js';
import { BackupError } from '../../src/type.js';

test('readConfigFile', async () => {
  cdTest();

  const TEST_FOLDER = 'readConfigFile';
  const CUSTOM_CONFIG_FILE = 'my-config.json';
  const INVALID_CONFIG_FILE = 'invalid-config.json';

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_FOLDER]: {
      [DEFAULT_CONFIG_FILE]: JSON.stringify({
        tasks: [
          {
            name: 'foo',
            source: 's0',
            destination: 'd0',
            replace: 'all',
            filter: 'intersection',
          },
          {
            source: 's1',
            destination: 'd1',
          },
        ],
      }),

      [CUSTOM_CONFIG_FILE]: JSON.stringify({
        tasks: [
          {
            source: 's',
            destination: 'd',
          },
        ],
      }),

      [INVALID_CONFIG_FILE]: JSON.stringify({}),
    },
  });

  assert.deepStrictEqual(
    await readConfigFile(
      `./root/${TEST_FOLDER}/${DEFAULT_CONFIG_FILE}`,
      DEFAULT_ENCODING,
    ),
    {
      tasks: [
        {
          name: 'foo',
          source: 's0',
          destination: 'd0',
          replace: 'all',
          filter: 'intersection',
        },
        {
          source: 's1',
          destination: 'd1',
        },
      ],
    },
  );

  assert.deepStrictEqual(
    await readConfigFile(
      `./root/${TEST_FOLDER}/${CUSTOM_CONFIG_FILE}`,
      DEFAULT_ENCODING,
    ),
    {
      tasks: [
        {
          source: 's',
          destination: 'd',
        },
      ],
    },
  );

  assert.rejects(
    () => readConfigFile(`./root/${TEST_FOLDER}/404.json`, DEFAULT_ENCODING),
    BackupError,
  );

  assert.rejects(
    () =>
      readConfigFile(
        `./root/${TEST_FOLDER}/${INVALID_CONFIG_FILE}`,
        DEFAULT_ENCODING,
      ),
    BackupError,
  );
});
