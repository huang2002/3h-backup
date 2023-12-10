import test from 'node:test';
import { TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import { DEFAULT_CONFIG_FILE, DEFAULT_ENCODING } from '../../src/config.js';
import assert from 'node:assert';
import { readConfigFile } from '../../src/readConfigFile.js';
import { BackupError } from '../../src/type.js';

const TEST_NAME = 'readConfigFile';
const CUSTOM_CONFIG_FILE = 'my-config.json';
const INVALID_CONFIG_FILE = 'invalid-config.json';

test(TEST_NAME, async () => {
  cdTest();

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_NAME]: {
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

  await Promise.all([
    test('default config file', async () => {
      assert.deepStrictEqual(
        await readConfigFile(
          `./root/${TEST_NAME}/${DEFAULT_CONFIG_FILE}`,
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
    }),

    test('custom config file', async () => {
      assert.deepStrictEqual(
        await readConfigFile(
          `./root/${TEST_NAME}/${CUSTOM_CONFIG_FILE}`,
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
    }),

    test('missing config file', async () => {
      assert.rejects(
        () => readConfigFile(`./root/${TEST_NAME}/404.json`, DEFAULT_ENCODING),
        BackupError,
      );
    }),

    test('invalid config file', async () => {
      assert.rejects(
        () =>
          readConfigFile(
            `./root/${TEST_NAME}/${INVALID_CONFIG_FILE}`,
            DEFAULT_ENCODING,
          ),
        BackupError,
      );
    }),
  ]);
});
