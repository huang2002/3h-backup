import { promises as fs } from 'node:fs';
import { readIgnoreFile } from '../helpers/readIgnoreFile.js';
import glob from 'fast-glob';
import path from 'node:path';

/**
 * @typedef GetBackupListOptions
 * @property {readonly string[]} ignoreFiles
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

  const ignorePatterns = await readIgnoreFile(
    root,
    options.ignoreFiles,
    options.encoding,
  );

  const searchPatterns = [
    '*',
    ...ignorePatterns.map((pattern) => {
      if (pattern[0] === '!') {
        return pattern.slice(1);
      } else {
        return '!' + pattern;
      }
    }),
  ];

  const matchedEntries = await glob(searchPatterns, {
    cwd: root,
    deep: 1,
    markDirectories: true,
  });

  const _output = output ?? [];
  for await (const entry of matchedEntries) {
    const entryPath = path.join(root, entry);
    if (entryPath.endsWith('/')) {
      await getBackupList(entryPath, options, _output);
    } else {
      _output.push(entryPath);
    }
  }

  return _output;
};
