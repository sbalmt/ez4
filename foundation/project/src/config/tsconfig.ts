import type { ProjectOptions } from '../types/project';

import { isAnyObject } from '@ez4/utils';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const loadAliasPaths = async (options: ProjectOptions) => {
  const tsconfigFile = options.tsconfigFile ?? 'tsconfig.json';
  const tsconfigPath = join(process.cwd(), tsconfigFile);

  const tsconfigUrl = pathToFileURL(tsconfigPath).href;

  try {
    const { default: tsconfig } = await import(tsconfigUrl, {
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

    return {};
  }
};
