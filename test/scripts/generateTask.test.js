import test from 'node:test';
import { TEST_ROOT_DIR, cdTest, setFileStructure } from './common.js';
import assert from 'node:assert';
import path from 'node:path';
import process from 'node:process';
import {
  DEFAULT_FILTER,
  DEFAULT_LIST_FILES,
  DEFAULT_REMOVE_EMPTY_DIRECTORY,
  DEFAULT_REPLACE,
} from '../../src/config.js';
import { generateTask } from '../../src/generateTask.js';

const TEST_NAME = 'generateTask';
const DEFAULT_TASK_NAME = 'T@5K';
const CUSTOM_TASK_NAME = 'my-task';
const CUSTOM_FILTER = 'union';
const CUSTOM_REPLACE = 'ctime';
const CUSTOM_LIST_FILES = ['my-backup-list.txt'];
const CUSTOM_REMOVE_EMPTY_DIRECTORY = false;

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
      dest: {
        'file-2.txt': 'file-2',
      },
    },
  });

  const TEST_FOLDER_PATH = path.join(TEST_ROOT_DIR, TEST_NAME);
  process.chdir(TEST_FOLDER_PATH);

  await Promise.all([
    test('default', async () => {
      assert.deepStrictEqual(
        await generateTask({
          config: {
            source: 'src',
            destination: 'backup',
          },
          defaultName: DEFAULT_TASK_NAME,
          base: '.',
          listFiles: DEFAULT_LIST_FILES,
          encoding: 'utf-8',
          defaultFilter: DEFAULT_FILTER,
          defaultReplace: DEFAULT_REPLACE,
          defaultRemoveEmptyDirectory: DEFAULT_REMOVE_EMPTY_DIRECTORY,
        }),
        /** @satisfies {import('../../src/type.js').BackupTask} */ ({
          name: DEFAULT_TASK_NAME,
          sourcePath: path.posix.resolve('src'),
          destinationPath: path.posix.resolve('backup'),
          fileList: [
            {
              source: path.posix.resolve('src/file-2.txt'),
              destination: path.posix.resolve('backup/file-2.txt'),
              action: 'copy',
            },
          ],
          filter: DEFAULT_FILTER,
          replace: DEFAULT_REPLACE,
          removeEmptyDirectory: DEFAULT_REMOVE_EMPTY_DIRECTORY,
        }),
      );
    }),

    test('custom', async () => {
      assert.deepStrictEqual(
        await generateTask({
          config: {
            name: CUSTOM_TASK_NAME,
            source: 'src',
            destination: 'dest',
            filter: CUSTOM_FILTER,
            replace: CUSTOM_REPLACE,
            removeEmptyDirectory: CUSTOM_REMOVE_EMPTY_DIRECTORY,
          },
          defaultName: DEFAULT_TASK_NAME,
          base: '.',
          listFiles: CUSTOM_LIST_FILES,
          encoding: 'utf-8',
          defaultFilter: DEFAULT_FILTER,
          defaultReplace: DEFAULT_REPLACE,
          defaultRemoveEmptyDirectory: DEFAULT_REMOVE_EMPTY_DIRECTORY,
        }),
        /** @satisfies {import('../../src/type.js').BackupTask} */ ({
          name: CUSTOM_TASK_NAME,
          sourcePath: path.posix.resolve('src'),
          destinationPath: path.posix.resolve('dest'),
          fileList: [
            {
              source: path.posix.resolve('src/file-2.txt'),
              destination: path.posix.resolve('dest/file-2.txt'),
              action: 'none',
            },
            {
              source: path.posix.resolve('src/foo/bar.txt'),
              destination: path.posix.resolve('dest/foo/bar.txt'),
              action: 'copy',
            },
          ],
          filter: CUSTOM_FILTER,
          replace: CUSTOM_REPLACE,
          removeEmptyDirectory: CUSTOM_REMOVE_EMPTY_DIRECTORY,
        }),
      );
    }),
  ]);
});
