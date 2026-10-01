import type { WorkerOptions } from './types';

import { Worker } from 'node:worker_threads';

import { WorkerSignal } from '../signals/types';
import { dispatch } from '../signals/dispatcher';

const WORKER_URL = new URL('./worker.mjs', import.meta.url);

export type WorkerInstance = {
  initialize: () => Promise<void>;
  invoke: (...inputs: unknown[]) => Promise<unknown>;
  terminate: () => Promise<void>;
};

export const createWorker = (options: WorkerOptions): WorkerInstance => {
  const { environment, entrypoint } = options;

  const worker = new Worker(WORKER_URL, {
    resourceLimits: {
      maxOldGenerationSizeMb: environment.memory
    },
    env: {
      ...process.env,
      ...environment.variables
    }
  });

  const initialize = async () => {
    await dispatch(worker, {
      signal: WorkerSignal.Start,
      module: entrypoint.module,
      file: entrypoint.file,
      name: entrypoint.name
    });
  };

  const invoke = (...inputs: unknown[]) => {
    return dispatch(worker, {
      signal: WorkerSignal.Invoke,
      inputs
    });
  };

  const terminate = async () => {
    await worker.terminate();
  };

  return {
    initialize,
    invoke,
    terminate
  };
};
