import test from 'node:test';
import { cdTest, setFileStructure, TEST_ROOT_DIR } from './common.js';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getAction } from '../../src/getAction.js';
import assert from 'node:assert';

test('getAction', async () => {
  cdTest();

  const TEST_FOLDER = 'getAction';

  await setFileStructure(TEST_ROOT_DIR, {
    [TEST_FOLDER]: {
      src: {},
      dest: {},
    },
  });
  await writeFile(`./root/${TEST_FOLDER}/src/file-0.txt`, 'file-0');
  await writeFile(`./root/${TEST_FOLDER}/src/file-2.txt`, 'file-2');
  await writeFile(`./root/${TEST_FOLDER}/dest/file-1.txt`, 'file-1');
  await writeFile(`./root/${TEST_FOLDER}/dest/file-3.txt`, 'file-3');
  await writeFile(`./root/${TEST_FOLDER}/src/file-1.txt`, 'file-1');
  await writeFile(`./root/${TEST_FOLDER}/dest/file-2.txt`, 'file-2');
  await writeFile(`./root/${TEST_FOLDER}/src/file-1.txt`, 'file-1_new');
  await writeFile(`./root/${TEST_FOLDER}/dest/file-2.txt`, 'file-2_new');

  const fileNames = ['file-0.txt', 'file-1.txt', 'file-2.txt', 'file-3.txt'];

  /**
   * @param {import('../../src/type.js').BackupReplace} replace
   * @param {import('../../src/type.js').BackupTaskFileAction[]} actions
   * @returns {Promise<void>}
   */
  const assertActions = (replace, actions) =>
    test(`replace === '${replace}'`, async () => {
      await Promise.all(
        fileNames.map(async (fileName, i) => {
          const source = path.join(`./root/${TEST_FOLDER}/src/`, fileName);
          const destination = path.join(
            `./root/${TEST_FOLDER}/dest/`,
            fileName,
          );
          const action = await getAction({
            source,
            destination,
            replace,
          });
          assert.strict(action, actions[i]);
        }),
      );
    });

  await Promise.all([
    assertActions('all', ['copy', 'copy', 'copy', 'remove']),
    assertActions('ctime', ['copy', 'none', 'copy', 'remove']),
    assertActions('mtime', ['copy', 'copy', 'none', 'remove']),
  ]);
});
