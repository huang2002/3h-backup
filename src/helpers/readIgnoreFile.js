import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { BackupError } from '../error.js';

/**
 * @param {string} root
 * @param {readonly string[]} candidates
 * @param {BufferEncoding} encoding
 * @returns {Promise<readonly string[]>} parsed ignore patterns
 */
export const readIgnoreFile = async (root, candidates, encoding) => {
  for (const candidate of candidates) {
    const filePath = path.join(root, candidate);

    if (!existsSync(filePath)) {
      continue;
    }

    try {
      const fileContent = await fs.readFile(filePath, { encoding });
      return fileContent.split('\n').map((line) => line.trim());
    } catch (error) {
      throw new BackupError('Failed to read ignore file: ' + filePath, error);
    }
  }

  return [];
};
