import { promises as fs, existsSync } from 'node:fs';
import { BackupError, configValidator } from './type.js';

/**
 * @param {string} configFilePath
 * @param {BufferEncoding} encoding
 * @returns {Promise<import('./type.js').BackupConfig>} parsed config
 */

export const readConfigFile = async (configFilePath, encoding) => {
  if (!existsSync(configFilePath)) {
    throw new BackupError('Failed to find the config file: ' + configFilePath);
  }

  /**
   * @type {import('./type.js').BackupConfig}
   */
  let config;
  try {
    const configFileContent = await fs.readFile(configFilePath, { encoding });
    config = JSON.parse(configFileContent);
  } catch (error) {
    throw new BackupError('Failed to read the config.', error);
  }

  try {
    configValidator.validate(config);
  } catch (error) {
    throw new BackupError('Invalid config.', error);
  }

  return config;
};
