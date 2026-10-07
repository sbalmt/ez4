import type { AnyObject } from '@ez4/utils';
import type { WorkerInstance, WorkerOptions } from '../types/worker';

import { Worker } from 'node:worker_threads';

import { WorkerSignal } from '../types/signal';
import { dispatch } from '../process/dispatcher';

const WORKER_URL = new URL('./worker.mjs', import.meta.url);

export const createWorker = (options: WorkerOptions): WorkerInstance => {
  const { environment, handler, listener, manager, services = {}, references = {} } = options;

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
      timeout: environment.timeout,
      manager,
      services,
      references,
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
