import { getFileList } from './getFileList.js';
import { existsSync } from 'node:fs';
import { BackupError } from './type.js';

/**
 * @typedef GetBackupListOptions
 * @property {string} sourcePath
 * @property {string} destinationPath
 * @property {readonly string[]} listFiles
 * @property {BufferEncoding} encoding
 * @property {import('./type.js').BackupReplace} replace
 * @property {import('./type.js').BackupFilter} filter
 */

/**
 * @param {GetBackupListOptions} options
 * @returns {Promise<readonly string[]>} sorted backup file list
 */
export const getBackupList = async (options) => {
  const sourceList = await getFileList('', {
    root: options.sourcePath,
    listFiles: options.listFiles,
    encoding: options.encoding,
  });
  sourceList.sort();

  /**
   * @type {string[]}
   */
  const destinationList = [];
  if (options.filter !== 'source' || options.replace !== 'all') {
    if (!existsSync(options.destinationPath)) {
      if (options.filter === 'destination') {
        throw new BackupError(
          'Destination path does not exists: ' + options.destinationPath,
        );
      }
    } else {
      await getFileList(
        '',
        {
          root: options.destinationPath,
          listFiles: options.listFiles,
          encoding: options.encoding,
        },
        destinationList,
      );
      destinationList.sort();
    }
  }

  /**
   * @type {readonly string[]}
   */
  let filePathList;
  switch (options.filter) {
    case 'source': {
      filePathList = sourceList;
      break;
    }

    case 'destination': {
      filePathList = destinationList;
      break;
    }

    case 'intersection': {
      const destinationSet = new Set(destinationList);
      filePathList = sourceList.filter((filePath) =>
        destinationSet.has(filePath),
      );
      break;
    }

    case 'union': {
      const destinationSet = new Set(destinationList);
      filePathList = destinationList
        .concat(sourceList.filter((filePath) => !destinationSet.has(filePath)))
        .sort();
      break;
    }
  }

  return filePathList;
};
