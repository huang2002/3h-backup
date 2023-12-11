# 3h-backup

> A personal backup helper.

## Introduction

`3h-backup` is a personal backup helper that simply maintains a copy
of the files you specified. Its backup mechanism basically makes
file structure under destination path the same as source path.
The designed purpose of `3h-backup` is to backup important files
in somewhere like a USB drive.

## Usage

1. It is recommended to install `3h-backup` as a global package
    to have better version control and avoid potential breakage:

    ```bash
    npm install -g 3h-backup
    ```

2. Create a configuration file:

    ```json
    {
        "tasks": [
            {
                "source": "/path/to/data-root",
                "destination": "/path/to/backup-root"
            }
        ]
    }
    ```

3. Execute `3h-backup` and specifies your config file:

    ```bash
    3h-backup -c /path/to/config
    ```

Now, the program should be processing your backup tasks and you can
follow the instructions in your terminal to complete your backup.

For more help on the CLI program:

```bash
$ 3h-backup --help
A personal backup helper.

Usage:
  3h-backup [options]

Options:
  --help, -h              Show help info.
  --config, -c <path>     The Path to the config file.
                          Default: 3h-backup.json
  --json, -j              Print tasks in json format.
                          Default format: simple
```

## Configuration

Here, the configuration is described using the following TypeScript code,
where `BackupConfig` is the type of the whole JSON config file:

```ts
/**
 * File list filter. (See the subsections below for more info.)
 */
type BackupFilter = (
    | 'intersection'
    | 'source'
    | 'destination'
    | 'union'
);

/**
 * Replace strategy. (See the subsections below for more info.)
 */
type BackupReplace = (
    | 'mtime'
    | 'ctime'
    | 'all'
);

/**
 * Configuration per task. Note that `source`/`destination`
 * can be either an absolute path or a relative path based on
 * the path of the config file.
 */
interface BackupTaskConfig {
    name?: string;
    /**
     * Base path of source files which are going to be backed up.
     */
    source: string;
    /**
     * Path of destination where file copies should be placed.
     */
    destination: string;
    filter?: BackupFilter;
    replace?: BackupReplace;
    /**
     * If this is set to `true`,
     * any empty directory will be removed
     * when the last file in it is deleted.
     */
    removeEmptyDirectory?: boolean;
}

interface BackupConfig {
    tasks: readonly BackupTaskConfig[];
    /**
     * Encoding of list files.
     * @default 'utf-8'
     */
    encoding?: BufferEncoding;
    /**
     * Possible name of list files that
     * tell the program which file to back up.
     * @default ['.3h-backup-list']
     */
    listFiles?: readonly string[];
    /**
     * Default `filter` for all tasks.
     * @default source
     */
    filter?: BackupFilter;
    /**
     * Default `replace` for all tasks.
     * @default mtime
     */
    replace?: BackupReplace;
    /**
     * Default `removeEmptyDirectory` for all tasks.
     * @default true
     */
    removeEmptyDirectory?: boolean;
    /**
     * Whether to skip confirming step.
     * @default false
     */
    skipConfirm?: boolean;
}
```

### Filter

The `filter` option controls which files should be considered:

- `source`(default) -- Include files existing in source path only.
- `destination` -- Include files existing in destination path only.
- `intersection` -- Intersection of `source` files and `destination` files.
- `union` -- Union of `source` files and `destination` files.

Also, it affects creating new files and removing extra files:

- `source`(default) -- Create new files in destination path
    if there are corresponding source files.
- `destination` -- Remove extra files in destination path
    if corresponding source files don't exist.
- `intersection` -- Never create or remove files.
- `union` -- Combination of `source` and `destination`.

### Replace

The `replace` option tells when to replace an existing destination file:

- `all` -- Replace all destination files.
- `mtime`(default) -- Replace an existing destination file only if its
    last-modified time is earlier than that of corresponding source file.
- `ctime` -- Replace an existing destination file only if its creation
    time is earlier than that of corresponding source file.

## License

[ISC License](./LICENSE)
