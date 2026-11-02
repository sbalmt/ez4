import type { LoadedProjectOptions } from './project';

import { isAnyObject } from '@ez4/utils';

import { pathToFileURL } from 'node:url';
import { basename, resolve } from 'node:path';
import { existsSync } from 'node:fs';

import { MissingTsConfigFileError } from '../errors/tsconfig';

const DEFAULT_TSCONFIG_FILE = 'tsconfig.json';

export type AliasPaths = Record<string, string[]>;

export const loadPaths = async (options: LoadedProjectOptions): Promise<AliasPaths> => {
  return getPathsFrom(options);
};

export const tryLoadPaths = (options: LoadedProjectOptions): Promise<AliasPaths> | AliasPaths => {
  const fileName = getTsConfigPath(options.workspacePath, options.tsconfigFile);

  if (existsSync(fileName)) {
    return getPathsFrom(options);
  }

  return {};
};

export const getPathsFrom = async (options: LoadedProjectOptions): Promise<AliasPaths> => {
  const filePath = getTsConfigPath(options.workspacePath, options.tsconfigFile);
  const fileUrl = pathToFileURL(filePath).href;

  try {
    const { default: tsconfig } = await import(fileUrl, {
      with: {
        type: 'json'
      }
    });

    return {
      ...tsconfig.compilerOptions?.paths
    };
  } catch (error) {
    if (isAnyObject(error) && error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new MissingTsConfigFileError(basename(filePath));
    }

    throw error;
  }
};

const getTsConfigPath = (workspacePath: string, fileName?: string) => {
  return resolve(workspacePath, fileName || DEFAULT_TSCONFIG_FILE);
};
