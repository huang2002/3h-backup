import { Program } from '3h-cli';
import process from 'node:process';
import fs from 'node:fs';
import { DEFAULT_CONFIG_FILE, DEFAULT_ENCODING } from './config.js';
import { readConfigFile } from './readConfigFile.js';
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
    help: `The Path to the config file.\nDefault: ${DEFAULT_CONFIG_FILE}`,
  })
  .option({
    name: '--json',
    alias: '-j',
    help: 'Print tasks in json format.\nDefault format: simple',
  });

program
  .parse(process.argv)
  .then(async (args) => {
    const { options } = args;

    if (options.has('--help')) {
      return program.help();
    }

    const configFilePath = args.getOption('--config')[0] ?? DEFAULT_CONFIG_FILE;
    const configPath = path.resolve(configFilePath);
    const encoding = /** @type {BufferEncoding} */ (
      args.getOption('--encoding')[0] ?? DEFAULT_ENCODING
    );
    const config = await readConfigFile(configPath, encoding);
    const base = path.dirname(configPath);
    const tasksPrinterName = options.has('--json') ? 'json' : 'simple';

    await executeBackup({ config, base, tasksPrinterName });
  })
  .catch((reason) => {
    console.error(reason);
    process.kill(process.pid);
  });
