import { existsSync, promises as fs } from 'node:fs';

/**
 * @typedef GetActionOptions
 * @property {string} source
 * @property {string} destination
 * @property {boolean} [sourceExists] Provide existing results
 * when possible to reduce file operations.
 * @property {boolean} [destinationExists] Provide existing results
 * when possible to reduce file operations.
 * @property {import('./type.js').BackupReplace} replace
 */

/**
 * @param {GetActionOptions} options
 * @returns {Promise<import('./type.js').BackupTaskFileAction>}
 */
export const getAction = async (options) => {
  const sourceExists = options.sourceExists ?? existsSync(options.source);
  if (!sourceExists) {
    return 'remove';
  }

  const destinationExists =
    options.destinationExists ?? existsSync(options.destination);
  if (options.replace !== 'all' && destinationExists) {
    const sourceStats = await fs.stat(options.source);
    const destinationStats = await fs.stat(options.destination);

    switch (options.replace) {
      case 'mtime': {
        if (sourceStats.mtimeMs <= destinationStats.mtimeMs) {
          return 'none';
        }
        break;
      }

      case 'ctime': {
        if (sourceStats.ctimeMs <= destinationStats.ctimeMs) {
          return 'none';
        }
        break;
      }
    }
  }

  return 'copy';
};
