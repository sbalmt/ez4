import type { MessagePort } from 'node:worker_threads';

import { serialize } from '../utils/data';
import { getErrorData } from '../utils/errors';
import { WorkerSignal } from '../types/signal';

/**
 * Notify a result signal message to the main worker.
 *
 * @param worker Worker instace.
 * @param response Response to send.
 */
export const notifyResult = (worker: MessagePort, response: unknown) => {
  worker.postMessage(
    serialize({
      signal: WorkerSignal.Result,
      response
    })
  );
};

/**
 * Notify an error signal message to the main worker.
 *
 * @param worker Worker instace.
 * @param error Error to send.
 */
export const notifyError = (worker: MessagePort, error: unknown) => {
  worker.postMessage(
    serialize({
      signal: WorkerSignal.Error,
      error: getErrorData(error)
    })
  );
};
