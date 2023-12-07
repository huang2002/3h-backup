import { existsSync } from 'fs';
import { BackupError } from './error.js';
import {
  DEFAULT_ENCODING,
  DEFAULT_IGNORE_FILES,
  getBackupList,
} from './index.js';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';
import path from 'node:path';

/**
 * @param {import('./config.js').BackupConfig} config
 * @param {string} base
 * @returns {Promise<boolean>} `true` if done; `false` if canceled.
 */
export const executeBackup = async (config, base) => {
  /**
   * @type {string[]}
   */
  const backupList = [];

  for await (const task of config.tasks) {
    const sourcePath = path.resolve(base, task.source);
    if (!existsSync(sourcePath)) {
      throw new BackupError('Source path does not exists: ' + sourcePath);
    }

    await getBackupList(
      sourcePath,
      {
        ignoreFiles: config.ignoreFiles ?? DEFAULT_IGNORE_FILES,
        encoding: config.encoding ?? DEFAULT_ENCODING,
      },
      backupList,
    );
  }

  if (!config.skipConfirm) {
    console.log('Files to be backed up:');
    console.log('----------------------');
    for (const filePath of backupList) {
      console.log(filePath);
    }
    console.log();

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log(`Backup all ${backupList.length} file(s)?`);
    const confirm = await readline.question('Y or N: ');
    readline.close();
    if (confirm.toLowerCase() !== 'y') {
      console.log('Backup aborted.');
      return false;
    }
  }

  // TODO:
  return true;
};
