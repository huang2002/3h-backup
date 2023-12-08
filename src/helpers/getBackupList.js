import { promises as fs } from 'node:fs';
import { readListFile } from './readListFile.js';
import glob from 'fast-glob';
import path from 'node:path';

/**
 * @typedef GetBackupListOptions
 * @property {readonly string[]} listFiles
 * @property {BufferEncoding} encoding
 */

/**
 * @param {string} root
 * @param {GetBackupListOptions} options
 * @param {string[]} [output]
 * @returns {Promise<readonly string[]>} accumulated results
 */
export const getBackupList = async (root, options, output) => {
  if ((await fs.stat(root)).isFile()) {
    if (output) {
      output.push(root);
      return output;
    } else {
      return [root];
    }
  }

  const listedPatterns = await readListFile(
    root,
    options.listFiles,
    options.encoding,
  );
  const searchPatterns = listedPatterns.length ? listedPatterns : '*';
  const matchedEntries = await glob(searchPatterns, {
    cwd: root,
    deep: 1,
    onlyFiles: false,
    markDirectories: true,
  });

  const _output = output ?? [];
  for await (const entryName of matchedEntries) {
    const entryPath = path.join(root, entryName);
    if (entryName.endsWith('/')) {
      await getBackupList(entryPath, options, _output);
    } else {
      _output.push(entryPath);
    }
  }

  return _output;
};
