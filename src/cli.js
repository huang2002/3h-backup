import { Program } from '3h-cli';
import process from 'node:process';
import fs from 'node:fs';
import { DEFAULT_CONFIG_PATH, DEFAULT_ENCODING } from './config.js';
import { readConfigFile } from './helpers/readConfigFile.js';
import { executeBackup } from './executeBackup.js';
import path from 'node:path';

const packageJsonUrl = new URL('../package.json', import.meta.url);
const packageJsonContent = fs.readFileSync(packageJsonUrl, 'utf-8');
const packageJson = JSON.parse(packageJsonContent);

const program = new Program(packageJson.name, {
  title: packageJson.description,
});

program
  .option({
    name: '--help',
    alias: '-h',
    help: 'Show help info.',
  })
  .option({
    name: '--config',
    alias: '-c',
    value: '<path>',
    help: `The Path to the config file.\nDefault: ${DEFAULT_CONFIG_PATH}`,
  });

program
  .parse(process.argv)
  .then(async (args) => {
    const { options } = args;

    if (options.has('--help')) {
      return program.help();
    }

    const configPath = path.resolve(
      args.getOption('--config')[0] ?? DEFAULT_CONFIG_PATH,
    );
    const encoding = /** @type {BufferEncoding} */ (
      args.getOption('--encoding')[0] ?? DEFAULT_ENCODING
    );
    const config = await readConfigFile(configPath, encoding);
    const done = await executeBackup(config, path.dirname(configPath));
    if (done) {
      console.log('Backup succeeded.');
    }
  })
  .catch((reason) => {
    console.error(reason);
    process.exitCode = 1;
  });
