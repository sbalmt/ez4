import type { HandlerOptions } from './types';

import { Logger } from '@ez4/logger';

import { HandlerTimeoutError } from './errors';
import { createWorker } from './worker';

export type HandlerInstance<T> = {
  invoke: (...inputs: unknown[]) => Promise<T>;
};

export const createHandler = <T>(options: HandlerOptions): HandlerInstance<T> => {
  const { environment, entrypoint } = options;

  const headline = `${entrypoint.file}:${entrypoint.position.join(':')} [${entrypoint.name}]`;

  const timeout = environment.timeout * 1000;

  const cleanupLogs = (error?: unknown) => {
    if (!error) {
      return Logger.success(`${headline} Finished`);
    }

    Logger.error(`${headline} ${error}`);
    Logger.error(`${headline} Finished (with error)`);
  };

  const invoke = async (...inputs: unknown[]) => {
    const worker = createWorker(options);

    const timer = setTimeout(() => (terminating = worker.terminate()), timeout);

    let terminating: Promise<void> | undefined = undefined;

    try {
      Logger.log(`▶️  ${headline} Started`);

      await worker.initialize();

      const output = (await worker.invoke(...inputs)) as T;

      cleanupLogs();

      return output;
    } catch (error) {
      const handlerError = terminating ? new HandlerTimeoutError() : error;

      cleanupLogs(handlerError);

      throw handlerError;
    } finally {
      if (!terminating) {
        terminating = worker.terminate();
        clearTimeout(timer);
      }

      await terminating;
    }
  };

  return {
    invoke
  };
};
