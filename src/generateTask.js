import path from 'node:path';
import { getBackupList } from './getBackupList.js';
import { existsSync } from 'node:fs';
import { BackupError } from './type.js';
import { getAction } from './getAction.js';

/**
 * @typedef GenerateTaskOptions
 * @property {import('./type.js').BackupTaskConfig} config
 * @property {string} base
 * @property {string} defaultName
 * @property {readonly string[]} listFiles
 * @property {BufferEncoding} encoding
 * @property {import('./type.js').BackupReplace} defaultReplace
 * @property {import('./type.js').BackupFilter} defaultFilter
 * @property {boolean} defaultRemoveEmptyDirectory
 */

/**
 * @param {GenerateTaskOptions} options
 * @returns {Promise<import('./type.js').BackupTask>}
 */
export const generateTask = async (options) => {
  const { base, config } = options;

  const sourcePath = path.resolve(base, config.source);
  const destinationPath = path.resolve(base, config.destination);

  if (!existsSync(sourcePath)) {
    throw new BackupError('Source path does not exists: ' + sourcePath);
  }

  const name = config.name ?? options.defaultName;
  const replace = config.replace ?? options.defaultReplace;
  const filter = config.filter ?? options.defaultFilter;
  const removeEmptyDirectory =
    config.removeEmptyDirectory ?? options.defaultRemoveEmptyDirectory;

  const sourceList = await getBackupList('', {
    root: sourcePath,
    listFiles: options.listFiles,
    encoding: options.encoding,
  });
  sourceList.sort();

  /**
   * @type {string[]}
   */
  const destinationList = [];
  if (filter !== 'source' || replace !== 'all') {
    if (!existsSync(destinationPath)) {
      if (filter === 'destination') {
        throw new BackupError(
          'Destination path does not exists: ' + destinationPath,
        );
      }
    } else {
      await getBackupList(
        '',
        {
          root: destinationPath,
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
  switch (filter) {
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

  let operationCount = 0;
  const fileList = await Promise.all(
    filePathList.map(async (filePath) => {
      const source = path.join(sourcePath, filePath);
      const destination = path.join(destinationPath, filePath);
      const sourceExists = existsSync(source);
      const destinationExists = existsSync(destination);
      const action = await getAction({
        source,
        destination,
        sourceExists,
        destinationExists,
        replace,
      });
      if (action !== 'none') {
        operationCount += 1;
      }
      return { source, destination, sourceExists, destinationExists, action };
    }),
  );

  return {
    name,
    sourcePath,
    destinationPath,
    removeEmptyDirectory,
    fileList,
    operationCount,
  };
};
