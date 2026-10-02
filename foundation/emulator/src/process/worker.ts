import type { AnyObject } from '@ez4/utils';
import type { WorkerOptions } from './types';

import { Worker } from 'node:worker_threads';

import { WorkerSignal } from '../signals/types';
import { dispatch } from '../signals/dispatcher';

const WORKER_URL = new URL('./worker.mjs', import.meta.url);

export type WorkerInstance = {
  initialize: () => Promise<void>;
  terminate: () => Promise<void>;
  invoke: (...requests: AnyObject[]) => Promise<unknown>;
};

export const createWorker = (options: WorkerOptions): WorkerInstance => {
  const { environment, handler, listener } = options;

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
      listener,
      handler
    });
  };

  const terminate = async () => {
    await worker.terminate();
  };

  const invoke = (request: AnyObject) => {
    return dispatch(worker, {
      signal: WorkerSignal.Invoke,
      request
    });
  };

  return {
    initialize,
    terminate,
    invoke
  };
};
