import {
  DEFAULT_ENCODING,
  DEFAULT_FILTER,
  DEFAULT_LIST_FILES,
  DEFAULT_REMOVE_EMPTY_DIRECTORY,
  DEFAULT_REPLACE,
  DEFAULT_TASKS_PRINTER,
} from './config.js';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import { generateTask } from './generateTask.js';
import { executeTask } from './executeTask.js';
import { printTasks } from './printTasks.js';

/**
 * @typedef ExecuteBackupOptions
 * @property {import('./type.js').BackupConfig} config
 * @property {string} base
 * @property {string} [tasksPrinterName]
 */

/**
 * @param {ExecuteBackupOptions} options
 * @returns {Promise<boolean>} `true` if done; `false` if canceled.
 */
export const executeBackup = async (options) => {
  const { config } = options;

  const listFiles = config.listFiles ?? DEFAULT_LIST_FILES;
  const encoding = config.encoding ?? DEFAULT_ENCODING;
  const defaultReplace = config.replace ?? DEFAULT_REPLACE;
  const defaultFilter = config.filter ?? DEFAULT_FILTER;
  const defaultRemoveEmptyDirectory =
    config.removeEmptyDirectory ?? DEFAULT_REMOVE_EMPTY_DIRECTORY;

  /**
   * @type {import('./type.js').BackupTask[]}
   */
  const tasks = await Promise.all(
    config.tasks.map(async (taskConfig, index) =>
      generateTask({
        defaultName: `Task#${index}`,
        config: taskConfig,
        base: options.base,
        listFiles,
        encoding,
        defaultReplace,
        defaultFilter,
        defaultRemoveEmptyDirectory,
      }),
    ),
  );

  if (!config.skipConfirm) {
    const tasksPrinterName = options.tasksPrinterName ?? DEFAULT_TASKS_PRINTER;
    printTasks(tasks, tasksPrinterName);
    console.log();

    let totalCount = 0;
    for (const task of tasks) {
      for (const fileInfo of task.fileList) {
        if (fileInfo.action !== 'none') {
          totalCount += 1;
        }
      }
    }

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log(`Update all ${totalCount} file(s)?`);
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
