import type { AnyObject } from '@ez4/utils';
import type { HandlerOptions } from './types';

import { Logger } from '@ez4/logger';

import { formatLogPrefix } from './utils';
import { HandlerTimeoutError } from './errors';
import { createWorker } from './worker';

export type ModuleInstance<T> = {
  invoke: (request: AnyObject) => Promise<T>;
};

export const createModule = <T>(options: HandlerOptions): ModuleInstance<T> => {
  const { environment, handler } = options;

  const timeout = environment.timeout * 1000;
  const prefix = formatLogPrefix(handler);

  const invoke = async (request: AnyObject) => {
    const worker = createWorker(options);

    const timer = setTimeout(() => (exitPromise = worker.terminate()), timeout);

    let exitPromise: Promise<void> | undefined = undefined;

    try {
      Logger.log(`▶️  ${prefix} Started`);

      await worker.initialize();

      const output = (await worker.invoke(request)) as T;

      Logger.success(`${prefix} Finished`);

      return output;
    } catch (error) {
      const handlerError = exitPromise ? new HandlerTimeoutError() : error;

      Logger.error(`${prefix} ${handlerError}`);
      Logger.error(`${prefix} Finished (with error)`);

      throw handlerError;
    } finally {
      if (!exitPromise) {
        exitPromise = worker.terminate();
        clearTimeout(timer);
      }

      await exitPromise;
    }
  };

  return {
    invoke
  };
};
