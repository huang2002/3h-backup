import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { BackupError } from './type.js';

/**
 * @param {string} root
 * @param {readonly string[]} candidates
 * @param {BufferEncoding} encoding
 * @returns {Promise<string[]>} parsed patterns
 */
export const readListFile = async (root, candidates, encoding) => {
  for (const candidate of candidates) {
    const filePath = path.join(root, candidate);

    if (!existsSync(filePath)) {
      continue;
    }

    try {
      const fileContent = await fs.readFile(filePath, { encoding });
      return fileContent
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && line[0] !== '#');
    } catch (error) {
      throw new BackupError(
        'Failed to read backup list file: ' + filePath,
        error,
      );
    }
  }

  return ['*'];
};
