import type { AnyObject } from '@ez4/utils';
import type { ModuleInstance, ModuleOptions } from '../types/module';

import { Logger } from '@ez4/logger';

import { formatLogPrefix } from '../utils/logs';
import { ExecutionTimeoutError } from '../errors/handler';
import { createWorker } from './worker';

export const createModule = <T>(options: ModuleOptions): ModuleInstance<T> => {
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
      const handlerError = exitPromise ? new ExecutionTimeoutError() : error;

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
