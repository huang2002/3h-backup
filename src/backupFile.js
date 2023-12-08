import { existsSync, promises as fs } from 'node:fs';

/**
 * @typedef BackupFileOptions
 * @property {string} source
 * @property {string} destination
 * @property {import('./type.js').BackupReplace} replace
 * @property {import('./type.js').BackupFilter} filter
 */

/**
 * @param {BackupFileOptions} options
 * @returns {Promise<void>}
 */
export const backupFile = (options) => {
  const sourceExists = existsSync(options.source);
  const destinationExists = existsSync(options.destination);

  switch (options.replace) {
    case 'newer': {
      // TODO:
      break;
    }

    case 'older': {
      // TODO:
      break;
    }

    case 'all': {
      // TODO:
      break;
    }
  }

  if (sourceExists) {
    return fs.copyFile(options.source, options.destination);
  } else {
    return fs.rm(options.destination);
    // TODO: remove empty folders
  }
};
