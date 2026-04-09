import { loadEnvFile } from 'node:process';

import { isAnyObject } from '@ez4/utils';
import { Logger } from '@ez4/logger';

export const loadEnvironment = (fileName?: string) => {
  try {
    loadEnvFile(fileName);
  } catch (error) {
    if (!isAnyObject(error) || error.code !== 'ENOENT') {
      throw error;
    }

    Logger.warn(`Environment file '${fileName}' wasn't found.`);
  }
};
