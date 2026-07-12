import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';

import { pathToFileURL } from 'node:url';
import { basename, join } from 'node:path';
import { existsSync } from 'node:fs';

import { MissingTsConfigFileError } from '../errors/tsconfig';

const DEFAULT_TSCONFIG_FILE = 'tsconfig.json';

export type AliasPaths = Record<string, string[]>;

export const loadPaths = async (options: ProjectOptions, workspacePath?: string): Promise<AliasPaths> => {
  return getPathsFrom(options, workspacePath);
};

export const tryLoadPaths = (options: ProjectOptions, workspacePath?: string): Promise<AliasPaths> | AliasPaths => {
  const fileName = getTsConfigPath(options.tsconfigFile, workspacePath);

  if (existsSync(fileName)) {
    return getPathsFrom(options, workspacePath);
  }

  return {};
};

export const getPathsFrom = async (options: ProjectOptions, workspacePath?: string): Promise<AliasPaths> => {
  const filePath = getTsConfigPath(options.tsconfigFile, workspacePath);
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
      throw new MissingTsConfigFileError(basename(filePath));
    }

    throw error;
  }
};

const getTsConfigPath = (fileName?: string, workspacePath?: string) => {
  return join(workspacePath ?? process.cwd(), fileName || DEFAULT_TSCONFIG_FILE);
};
