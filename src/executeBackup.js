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
import { zip } from '3h-iter';
import { getBackupList } from './getBackupList.js';
import { backupFile } from './backupFile.js';

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

      const backupList = await getBackupList(sourcePath, {
        listFiles,
        encoding,
      });
      backupList.sort();
      taskFileLists[i] = backupList;
    }),
  );

  if (!config.skipConfirm) {
    console.log('Backup Tasks');
    console.log('------------');
    for (const [name, replace, filter, fileList] of zip(
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

  for (const [task, name, replace, filter, sourceList] of zip(
    config.tasks,
    taskNames,
    taskReplaceOptions,
    taskFilterOptions,
    taskFileLists,
  )) {
    console.log(`Executing task "${name}"...`);

    /**
     * @type {string[]}
     */
    const destinationList = [];
    if (filter !== 'source' || replace !== 'all') {
      const destinationPath = path.resolve(base, task.destination);
      if (!existsSync(destinationPath)) {
        throw new BackupError(
          'Destination path does not exists: ' + destinationPath,
        );
      }
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

    const sourcePath = path.resolve(base, task.source);
    const destinationPath = path.resolve(base, task.destination);

    // TODO: pave the destination path if needed
    await Promise.all(
      fileList.map((filePath) =>
        backupFile({
          source: path.join(sourcePath, filePath),
          destination: path.join(destinationPath, filePath),
          replace,
          filter,
        }),
      ),
    );
  }

  console.log('Backup succeeded.');

  return true;
};
