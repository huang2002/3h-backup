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
export const backupFile = async (options) => {
  const sourceExists = existsSync(options.source);
  const destinationExists = existsSync(options.destination);

  if (options.replace !== 'all' && destinationExists) {
    const sourceStats = await fs.stat(options.source);
    const destinationStats = await fs.stat(options.destination);

    switch (options.replace) {
      case 'mtime': {
        if (sourceStats.mtimeMs <= destinationStats.mtimeMs) {
          return;
        }
        break;
      }

      case 'ctime': {
        if (sourceStats.ctimeMs <= destinationStats.ctimeMs) {
          return;
        }
        break;
      }
    }
  }

  if (sourceExists) {
    return fs.copyFile(options.source, options.destination);
  } else {
    return fs.rm(options.destination);
    // TODO: remove empty folders
  }
};
