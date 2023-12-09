import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const TEST_SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_DIR = path.resolve(TEST_SCRIPT_DIR, '..');

export const initTestDir = () => {
  process.chdir(TEST_DIR);
};
