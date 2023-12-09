import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import pavePath from 'pave-path';

export const TEST_SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const TEST_DIR = path.resolve(TEST_SCRIPT_DIR, '..');
export const TEST_ROOT_DIR = path.resolve(TEST_DIR, 'root');

export const ENCODING = 'utf-8';

export const cdTest = () => {
  process.chdir(TEST_DIR);
};

/**
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<string>}
 */
export const execAsync = (command, args) =>
  new Promise((resolve, reject) => {
    const fullCommand = command + ' ' + args.join(' ');
    exec(fullCommand, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

/**
 * @typedef {{
 *   [name: string]: string | FileStructure;
 * }} FileStructure
 */

/**
 * @param {string} base
 * @param {FileStructure} description
 * @param {boolean} [internalFlag]
 * @returns {Promise<void>}
 */
export const setFileStructure = async (base, description, internalFlag) => {
  if (!existsSync(base)) {
    if (internalFlag) {
      await mkdir(base);
    } else {
      await pavePath(base);
    }
  }

  if (!internalFlag) {
    // remove existing structure
    await Promise.all(
      Object.entries(description).map(async (entry) => {
        const [key, value] = entry;
        if (typeof value !== 'string') {
          const entryPath = path.join(base, key);
          if (existsSync(entryPath)) {
            await rm(entryPath, { recursive: true });
          }
        }
      }),
    );
  }

  await Promise.all(
    Object.entries(description).map(async (entry) => {
      const [key, value] = entry;
      const entryPath = path.join(base, key);
      if (typeof value === 'string') {
        await writeFile(entryPath, value);
      } else {
        await setFileStructure(entryPath, value, true);
      }
    }),
  );
};

/**
 * @param {string} base
 * @param {BufferEncoding} encoding
 * @returns {Promise<FileStructure>}
 */
export const getFileStructure = async (base, encoding) => {
  const entries = await readdir(base, { withFileTypes: true });

  return Object.fromEntries(
    await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(base, entry.name);
        if (entry.isDirectory()) {
          const directoryStructure = await getFileStructure(
            entryPath,
            encoding,
          );
          return [entry.name, directoryStructure];
        } else {
          const fileContent = await readFile(entryPath, { encoding });
          return [entry.name, fileContent];
        }
      }),
    ),
  );
};
