import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';
import { Logger } from '@ez4/logger';

import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_TSCONFIG_FILE = 'tsconfig.json';

export type AliasPaths = Record<string, string[]>;

export const loadPaths = async (options: ProjectOptions): Promise<AliasPaths> => {
  return loadPathsFrom(process.cwd(), options);
};

export const loadPathsFrom = async (path: string, options: ProjectOptions): Promise<AliasPaths> => {
  const fileName = options.tsconfigFile ?? DEFAULT_TSCONFIG_FILE;

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
    if (!isAnyObject(error) || error.code !== 'ERR_MODULE_NOT_FOUND') {
      throw error;
    }

    Logger.warn(`File '${basename(filePath)}' wasn't found.`);

    return {};
  }
};
