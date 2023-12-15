/**
 * @callback TaskPrinter
 * @param {import('./type.js').BackupTask[]} tasks
 * @param {(content: string) => void} logger
 * @returns {void}
 */

import path from 'node:path';
import { BackupError } from './type.js';

/**
 * @type {Map<string, TaskPrinter>}
 */
export const tasksPrinters = new Map([
  [
    'json',
    (tasks, logger) => {
      const jsonOutput = JSON.stringify(tasks, null, 2);
      logger('Backup Tasks: ' + jsonOutput);
    },
  ],
  [
    'simple',
    (tasks, logger) => {
      logger('Backup Tasks:');
      for (const task of tasks) {
        if (!task.operationCount) {
          continue;
        }

        logger(`[ ${task.name} ]`);
        logger(`* sourcePath           = ${task.sourcePath}`);
        logger(`* destinationPath      = ${task.destinationPath}`);
        logger(`* removeEmptyDirectory = ${task.removeEmptyDirectory}`);

        logger(`* fileList: (${task.operationCount})`);
        for (const fileInfo of task.fileList) {
          const source = path.relative(task.sourcePath, fileInfo.source);
          const destination = path.relative(
            task.destinationPath,
            fileInfo.destination,
          );
          switch (fileInfo.action) {
            case 'copy': {
              logger(`    + (update) ${source} -> ${destination}`);
              break;
            }
            case 'remove': {
              logger(`    - (remove) ${destination}`);
              break;
            }
            default: {
              // no-op
              break;
            }
          }
        }
      }
    },
  ],
]);

/**
 * @param {import('./type.js').BackupTask[]} tasks
 * @param {string} printerName
 * @param {(content: string) => void} [logger=console.log]
 */
export const printTasks = (tasks, printerName, logger = console.log) => {
  const printer = tasksPrinters.get(printerName);
  if (!printer) {
    throw new BackupError('unknown printer name: ' + printerName);
  }
  printer(tasks, logger);
};
