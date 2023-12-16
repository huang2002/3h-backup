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
 * @property {string[]} [selectedTasks]
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

  const { selectedTasks } = options;
  const allTasks = selectedTasks
    ? config.tasks.filter(
        (task, index) =>
          (typeof task.name === 'string' &&
            selectedTasks.includes(task.name)) ||
          selectedTasks.includes(index.toFixed()),
      )
    : config.tasks;

  /**
   * @type {import('./type.js').BackupTask[]}
   */
  const tasks = await Promise.all(
    allTasks.map((taskConfig, index) =>
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

    const totalCount = tasks.reduce(
      (sum, task) => sum + task.operationCount,
      0,
    );

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
    if (!task.operationCount) {
      continue;
    }
    console.log(`Executing task "${task.name}"...`);
    await executeTask(task);
  }

  console.log('Backup succeeded.');

  return true;
};
