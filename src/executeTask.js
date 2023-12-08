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
        await pavePath(dirPath, lastDirPath);
      } else {
        await pavePath(dirPath);
      }
      lastDirPath = dirPath;
    }

    switch (fileInfo.action) {
      case 'copy': {
        return fs.copyFile(fileInfo.source, fileInfo.destination);
      }
      case 'remove': {
        return fs.rm(fileInfo.destination);
      }
      case 'none': {
        // do nothing
        break;
      }
    }
  }
};
