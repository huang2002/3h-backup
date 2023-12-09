import path from 'node:path';
import { promises as fs } from 'node:fs';
import pavePath from 'pave-path';

/**
 * @param {import('./type.js').BackupTask} task
 */
export const executeTask = async (task) => {
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
        break;
      }
      case 'none': {
        // do nothing
        break;
      }
    }
  }
};
