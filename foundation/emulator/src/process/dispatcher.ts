import type { Worker } from 'node:worker_threads';
import type { WorkerSignals } from '../types/signal';

import { isAnyObject } from '@ez4/utils';

import { UnexpectedSignalError } from '../errors/signal';
import { WorkerMemoryLimitError, WorkerTerminatedError } from '../errors/worker';
import { EntrypointNotFoundError, ServiceNotFoundError } from '../errors/handler';
import { deserialize, serialize } from '../utils/data';
import { logErrorData } from '../utils/errors';
import { WorkerSignal } from '../types/signal';
import { notifyProvider } from './provider';

/**
 * Dispatch a signal message to the worker and awaits for a response.
 *
 * @param worker Worker instace.
 * @param signal Signal to send.
 * @returns Returns the signal output received from the worker.
 */
export const dispatch = (worker: Worker, signal: WorkerSignals) => {
  return new Promise((resolve, reject) => {
    const cleanupListeners = () => {
      worker.off('error', onError);
      worker.off('message', onMessage);
      worker.off('exit', onExit);
    };

    const onError = (error: unknown) => {
      cleanupListeners();

      if (isMemoryLimitError(error)) {
        reject(new WorkerMemoryLimitError());
      } else {
        reject(error);
      }
    };

    const onMessage = (message: string) => {
      try {
        const data = deserialize(message);

        switch (data.signal) {
          default:
            onError(new UnexpectedSignalError(data.signal));
            break;

          case WorkerSignal.Event: {
            notifyProvider(data.provider, data.event, data.payload).catch((error) => {
              logErrorData(error);
            });
            break;
          }

          case WorkerSignal.Result: {
            cleanupListeners();
            resolve(data.response);
            break;
          }

          case WorkerSignal.Error: {
            const error = isServiceError(data.error)
              ? new ServiceNotFoundError(data.error.message)
              : isEntrypointError(data.error)
                ? new EntrypointNotFoundError(data.error.message)
                : new Error(data.error.message);

            error.stack = data.error.stack;

            onError(error);
            break;
          }
        }
      } catch (error) {
        onError(error);
      }
    };

    const onExit = (code: number) => {
      cleanupListeners();
      reject(new WorkerTerminatedError(code));
    };

    worker.on('error', onError);
    worker.on('message', onMessage);
    worker.on('exit', onExit);

    try {
      worker.postMessage(serialize(signal));
    } catch (error) {
      onError(error);
    }
  });
};

const isMemoryLimitError = (error: unknown) => {
  return isAnyObject(error) && error.code === 'ERR_WORKER_OUT_OF_MEMORY';
};

const isEntrypointError = (error: unknown) => {
  return isAnyObject(error) && error.name === 'EntrypointNotFoundError';
};

const isServiceError = (error: unknown) => {
  return isAnyObject(error) && error.name === 'ServiceNotFoundError';
};
