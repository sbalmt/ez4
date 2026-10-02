import type { WorkerEntrypoint } from '../process/types';
import type { FunctionCallback } from './types';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { EntrypointNotFoundError } from './errors';

export const loadFunction = async (entrypoint: WorkerEntrypoint): Promise<FunctionCallback> => {
  const moduleUrl = entrypoint.module ? entrypoint.module : pathToFileURL(join(process.cwd(), entrypoint.file)).href;

  const { [entrypoint.name]: callback } = await import(moduleUrl);

  if (typeof callback !== 'function') {
    throw new EntrypointNotFoundError(entrypoint.name, entrypoint.file);
  }

  return callback as FunctionCallback;
};
