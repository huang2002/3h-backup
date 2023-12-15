import path from 'node:path';
import { promises as fs } from 'node:fs';
import pavePath from 'pave-path';

/**
 * @param {import('./type.js').BackupTask} task
 * @returns {Promise<void>}
 */
export const executeTask = async (task) => {
  if (!task.operationCount) {
    return;
  }

  /**
   * @type {Set<string> | null}
   */
  const maybeEmptyPaths = task.removeEmptyDirectory ? new Set() : null;
  let lastDirPath = '';

  for (const fileInfo of task.fileList) {
    // Since file list has been sorted,
    // parent directory should be ahead.
    const dirPath = path.dirname(fileInfo.destination);
    if (dirPath !== lastDirPath) {
      if (lastDirPath && dirPath.startsWith(lastDirPath)) {
        const pathToPave = path.relative(lastDirPath, dirPath);
        await pavePath(pathToPave, lastDirPath);
      } else {
        await pavePath(dirPath);
      }
      lastDirPath = dirPath;
    }

    switch (fileInfo.action) {
      case 'copy': {
        await fs.copyFile(fileInfo.source, fileInfo.destination);
        break;
      }
      case 'remove': {
        await fs.rm(fileInfo.destination);
        if (task.removeEmptyDirectory) {
          /** @type {Set<string>} */ (maybeEmptyPaths).add(dirPath);
        }
        break;
      }
      case 'none': {
        // do nothing
        break;
      }
    }
  }

  if (task.removeEmptyDirectory) {
    for (const dirPath of /** @type {Set<string>} */ (maybeEmptyPaths)) {
      if ((await fs.readdir(dirPath)).length === 0) {
        await fs.rmdir(dirPath);
      }
    }
  }
};
