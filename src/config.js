import HType from '3h-validate';

export const DEFAULT_CONFIG_PATH = '3h-backup.json';
export const DEFAULT_ENCODING = 'utf-8';
export const DEFAULT_LIST_FILES = ['.3h-backup-list'];

const { types } = HType;
const stringValidator = types.string();
const booleanValidator = types.boolean();

/**
 * @param {import('3h-validate').Type} validator
 */
const optional = (validator) =>
  types.union({
    validators: [types.none(), validator],
  });

/**
 * @typedef BackupTask
 * @property {string} source
 * @property {string} destination
 */

export const taskValidator = types.dict({
  pattern: {
    source: stringValidator,
    destination: stringValidator,
  },
});

/**
 * @typedef BackupConfig
 * @property {readonly BackupTask[]} tasks
 * @property {BufferEncoding} [encoding=DEFAULT_ENCODING]
 * @property {readonly string[]} [listFiles=DEFAULT_LIST_FILES] sorted by priority, descending
 * @property {boolean} [skipConfirm=false]
 */

export const configValidator = types.dict({
  pattern: {
    tasks: types.array({
      pattern: taskValidator,
    }),
    listFiles: optional(
      types.array({
        pattern: stringValidator,
      }),
    ),
    encoding: optional(stringValidator),
    skipConfirm: optional(booleanValidator),
  },
});
