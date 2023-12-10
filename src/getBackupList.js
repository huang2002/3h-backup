import { promises as fs } from 'node:fs';
import { readListFile } from './readListFile.js';
import glob from 'fast-glob';
import path from 'node:path/posix';

/**
 * @typedef GetBackupListOptions
 * @property {readonly string[]} listFiles
 * @property {BufferEncoding} encoding
 * @property {string} root
 */

/**
 * @param {string} prefix
 * @param {GetBackupListOptions} options
 * @param {string[]} [output]
 * @returns {Promise<string[]>} accumulated paths, relative to `root`
 */
export const getBackupList = async (prefix, options, output) => {
  const basePath = path.join(options.root, prefix);
  if ((await fs.stat(basePath)).isFile()) {
    if (output) {
      output.push(basePath);
      return output;
    } else {
      return [basePath];
    }
  }

  const listPatterns = await readListFile(
    basePath,
    options.listFiles,
    options.encoding,
  );
  const matchedEntries = await glob(listPatterns, {
    cwd: basePath,
    deep: 1,
    onlyFiles: false,
    markDirectories: true,
  });

  const _output = output ?? [];
  for await (const entryName of matchedEntries) {
    const entryPath = path.join(prefix, entryName);
    if (entryName.endsWith('/')) {
      await getBackupList(entryPath, options, _output);
    } else {
      _output.push(entryPath);
    }
  }

  return _output;
};
