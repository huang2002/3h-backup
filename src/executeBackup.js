import { existsSync } from 'fs';
import { BackupError } from './type.js';
import {
  DEFAULT_ENCODING,
  DEFAULT_FILTER,
  DEFAULT_LIST_FILES,
  DEFAULT_REPLACE,
} from './config.js';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import path from 'node:path';
import HIter from '3h-iter';
import { getBackupList } from './getBackupList.js';
import { backupFile } from './backupFile.js';
import pavePath from 'pave-path';

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

  const taskNames = config.tasks.map(
    (task, index) => task.name ?? `Task#${index}`,
  );
  const taskReplaceOptions = config.tasks.map(
    (task) => task.replace ?? defaultReplace,
  );
  const taskFilterOptions = config.tasks.map(
    (task) => task.filter ?? defaultFilter,
  );

  /**
   * @type {(readonly string[])[]} sorted per task
   */
  const taskFileLists = Array(config.tasks.length);

  await Promise.all(
    config.tasks.map(async (task, i) => {
      const sourcePath = path.resolve(base, task.source);
      if (!existsSync(sourcePath)) {
        throw new BackupError('Source path does not exists: ' + sourcePath);
      }

      const sourceList = await getBackupList(sourcePath, {
        listFiles,
        encoding,
      });
      sourceList.sort();

      const replace = taskReplaceOptions[i];
      const filter = taskFilterOptions[i];

      /**
       * @type {string[]}
       */
      const destinationList = [];
      if (filter !== 'source' || replace !== 'all') {
        const destinationPath = path.resolve(base, task.destination);
        if (!existsSync(destinationPath)) {
          if (filter === 'destination') {
            throw new BackupError(
              'Destination path does not exists: ' + destinationPath,
            );
          } else {
            await pavePath(destinationPath);
          }
        } else {
          await getBackupList(
            destinationPath,
            {
              listFiles,
              encoding,
            },
            destinationList,
          );
          destinationList.sort();
        }
      }

      /**
       * @type {readonly string[]}
       */
      let fileList;
      switch (filter) {
        case 'source': {
          fileList = sourceList;
          break;
        }

        case 'destination': {
          fileList = destinationList;
          break;
        }

        case 'intersection': {
          const destinationSet = new Set(destinationList);
          fileList = sourceList.filter((filePath) =>
            destinationSet.has(filePath),
          );
          break;
        }

        case 'union': {
          const destinationSet = new Set(destinationList);
          fileList = destinationList
            .concat(
              sourceList.filter((filePath) => !destinationSet.has(filePath)),
            )
            .sort();
          break;
        }
      }

      taskFileLists[i] = fileList;
    }),
  );

  if (!config.skipConfirm) {
    console.log('Backup Tasks');
    console.log('------------');
    for (const [name, replace, filter, fileList] of HIter.zip(
      taskNames,
      taskReplaceOptions,
      taskFilterOptions,
      taskFileLists,
    )) {
      console.log(`[ ${name} ] { replace: "${replace}", filter: "${filter}" }`);
      for (const filePath of fileList) {
        console.log(filePath);
      }
    }
    console.log();

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const totalCount = taskFileLists.reduce(
      (count, list) => count + list.length,
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

  for (const [task, name, replace, filter, fileList] of HIter.zip(
    config.tasks,
    taskNames,
    taskReplaceOptions,
    taskFilterOptions,
    taskFileLists,
  )) {
    console.log(`Executing task "${name}"...`);

    const sourcePath = path.resolve(base, task.source);
    const destinationPath = path.resolve(base, task.destination);

    let lastDirPath = '';
    for (const filePath of fileList) {
      // Since file list has been sorted,
      // parent directory should be ahead.
      const dirPath = path.dirname(filePath);
      if (dirPath !== lastDirPath) {
        if (lastDirPath && dirPath.startsWith(lastDirPath)) {
          await pavePath(dirPath, lastDirPath);
        } else {
          await pavePath(dirPath);
        }
        lastDirPath = dirPath;
      }

      await backupFile({
        source: path.join(sourcePath, filePath),
        destination: path.join(destinationPath, filePath),
        replace,
        filter,
      });
    }
  }

  console.log('Backup succeeded.');

  return true;
};
