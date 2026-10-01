import type { Worker } from 'node:worker_threads';
import type { WorkerSignals } from './types';

import { deserialize, serialize } from './serializer';
import { UnexpectedSignalError, WorkerMemoryLimitError, WorkerTerminatedError } from './errors';
import { WorkerSignal } from './types';

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

      if (error instanceof Error && 'code' in error && error.code === 'ERR_WORKER_OUT_OF_MEMORY') {
        reject(new WorkerMemoryLimitError());
      } else {
        reject(error);
      }
    };

    const onMessage = (message: string) => {
      cleanupListeners();

      try {
        const data = deserialize(message);

        switch (data.signal) {
          default:
            reject(new UnexpectedSignalError(data.signal));
            break;

          case WorkerSignal.Ready: {
            resolve(undefined);
            break;
          }

          case WorkerSignal.Result: {
            resolve(data.output);
            break;
          }

          case WorkerSignal.Error: {
            const error = new Error(data.error.message);

            error.stack = data.error.stack;
            error.name = data.error.name;

            reject(error);
            break;
          }
        }
      } catch (error) {
        reject(error);
      }
    };

    const onExit = (code: number) => {
      cleanupListeners();
      reject(new WorkerTerminatedError(code));
    };

    worker.once('error', onError);
    worker.once('message', onMessage);
    worker.once('exit', onExit);

    try {
      worker.postMessage(serialize(signal));
    } catch (error) {
      onError(error);
    }
  });
};
