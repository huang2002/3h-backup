import {
  DEFAULT_ENCODING,
  DEFAULT_FILTER,
  DEFAULT_LIST_FILES,
  DEFAULT_REPLACE,
} from './config.js';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import { generateTask } from './generateTask.js';
import { executeTask } from './executeTask.js';

/**
 * @param {import('./type.js').BackupConfig} config
 * @param {string} base
 * @returns {Promise<boolean>} `true` if done; `false` if canceled.
 */
export const executeBackup = async (config, base) => {
  const listFiles = config.listFiles ?? DEFAULT_LIST_FILES;
  const encoding = config.encoding ?? DEFAULT_ENCODING;
  const defaultReplace = config.defaultReplace ?? DEFAULT_REPLACE;
  const defaultFilter = config.defaultFilter ?? DEFAULT_FILTER;

  /**
   * @type {import('./type.js').BackupTask[]}
   */
  const tasks = await Promise.all(
    config.tasks.map(async (taskConfig, index) =>
      generateTask({
        defaultName: `Task#${index}`,
        config: taskConfig,
        base,
        listFiles,
        encoding,
        defaultReplace,
        defaultFilter,
      }),
    ),
  );

  if (!config.skipConfirm) {
    console.log('Backup Tasks: ' + JSON.stringify(tasks, null, 2));
    console.log();

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const totalCount = tasks.reduce(
      (count, task) => count + task.fileList.length,
      0,
    );
    console.log(`Backup all ${totalCount} file(s)?`);
    const confirm = await readline.question('Y or N: ');
    readline.close();
    if (confirm.toLowerCase() !== 'y') {
      console.log('Backup aborted.');
      return false;
    }
  }

  console.log();
  console.log('Backup started.');

  for (const task of tasks) {
    console.log(`Executing task "${task.name}"...`);
    await executeTask(task);
  }

  console.log('Backup succeeded.');

  return true;
};
