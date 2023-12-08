import HType from '3h-validate';

export const { types } = HType;
export const stringValidator = types.string();
export const booleanValidator = types.boolean();

/**
 * @param {import('3h-validate').Type} validator
 */
export const optional = (validator) =>
  types.union({
    validators: [types.none(), validator],
  });

/**
 * @typedef {(
 *   | 'mtime'
 *   | 'ctime'
 *   | 'all'
 * )} BackupReplace
 */

export const backupReplaceValidator = types.string({
  pattern: /^mtime|ctime|all$/,
});

/**
 * @typedef {(
 *   | 'intersection'
 *   | 'source'
 *   | 'destination'
 *   | 'union'
 * )} BackupFilter
 */

export const backupFilterValidator = types.string({
  pattern: /^intersection|source|destination|union$/,
});

/**
 * @typedef BackupTaskConfig
 * @property {string} [name]
 * @property {string} source
 * @property {string} destination
 * @property {BackupReplace} [replace]
 * @property {BackupFilter} [filter]
 */

export const taskConfigValidator = types.dict({
  pattern: {
    name: optional(stringValidator),
    source: stringValidator,
    destination: stringValidator,
    replace: optional(backupReplaceValidator),
    filter: optional(backupFilterValidator),
  },
});

/**
 * @typedef {(
 *   | 'copy'
 *   | 'remove'
 *   | 'none'
 * )} BackupTaskFileAction
 */

/**
 * @typedef BackupTaskFileInfo
 * @property {string} source
 * @property {string} destination
 * @property {BackupTaskFileAction} action
 */

/**
 * @typedef BackupTask
 * @property {string} name
 * @property {string} sourcePath
 * @property {string} destinationPath
 * @property {BackupReplace} replace
 * @property {BackupFilter} filter
 * @property {readonly BackupTaskFileInfo[]} fileList
 */

/**
 * @typedef BackupConfig
 * @property {readonly BackupTaskConfig[]} tasks
 * @property {BufferEncoding} [encoding=DEFAULT_ENCODING]
 * @property {readonly string[]} [listFiles=DEFAULT_LIST_FILES] sorted by priority, descending
 * @property {BackupReplace} [defaultReplace]
 * @property {BackupFilter} [defaultFilter]
 * @property {boolean} [skipConfirm=false]
 */

export const configValidator = types.dict({
  pattern: {
    tasks: types.array({
      pattern: taskConfigValidator,
    }),
    listFiles: optional(
      types.array({
        pattern: stringValidator,
      }),
    ),
    encoding: optional(stringValidator),
    skipConfirm: optional(booleanValidator),
    defaultReplace: optional(backupReplaceValidator),
    defaultFilter: optional(backupFilterValidator),
  },
});

export class BackupError extends Error {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message, cause) {
    super(message, { cause });
    this.name = 'BackupError';
  }
}
