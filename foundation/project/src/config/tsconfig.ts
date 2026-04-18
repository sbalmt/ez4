import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';

import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { MissingTsConfigFileError } from '../errors/tsconfig';

const DEFAULT_TSCONFIG_FILE = 'tsconfig.json';

export type AliasPaths = Record<string, string[]>;

export const loadPaths = async (options: ProjectOptions): Promise<AliasPaths> => {
  return getPathsFrom(process.cwd(), options);
};

export const tryLoadPaths = (options: ProjectOptions): Promise<AliasPaths> | AliasPaths => {
  const fileName = getTsConfigPath(options);

  if (existsSync(fileName)) {
    return getPathsFrom(process.cwd(), options);
  }

  return {};
};

export const getPathsFrom = async (path: string, options: ProjectOptions): Promise<AliasPaths> => {
  const fileName = getTsConfigPath(options);
  const filePath = join(path, fileName);
  const fileUrl = pathToFileURL(filePath).href;

  try {
    const { default: tsconfig } = await import(fileUrl, {
      with: {
        type: 'json'
      }
    });

    const { compilerOptions } = tsconfig;

    return compilerOptions?.paths ?? {};
  } catch (error) {
    if (isAnyObject(error) && error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new MissingTsConfigFileError(fileName);
    }

    throw error;
  }
};

const getTsConfigPath = (options: ProjectOptions) => {
  return options.tsconfigFile ?? DEFAULT_TSCONFIG_FILE;
};
