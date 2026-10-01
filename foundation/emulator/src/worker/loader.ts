import type { StartWorkerSignal } from '../signals/types';
import type { HandlerFunction } from '../process/types';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { EntrypointNotFoundError } from './errors';

export const loadHandler = async (signal: StartWorkerSignal): Promise<HandlerFunction> => {
  const moduleUrl = signal.module ? signal.module : pathToFileURL(join(process.cwd(), signal.file)).href;

  const { [signal.name]: handler } = await import(moduleUrl);

  if (typeof handler !== 'function') {
    throw new EntrypointNotFoundError(signal.name, signal.file);
  }

  return handler as HandlerFunction;
};
