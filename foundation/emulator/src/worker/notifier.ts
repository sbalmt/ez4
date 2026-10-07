import type { AnyObject } from '@ez4/utils';

import type { MessagePort } from 'node:worker_threads';

import { WorkerSignal } from '../types/signal';
import { getErrorData } from '../utils/errors';
import { serialize } from '../utils/data';

/**
 * Notify a data signal message to the main worker.
 *
 * @param worker Worker instace.
 * @param response Response to send.
 */
export const notifyData = (worker: MessagePort, response: unknown) => {
  worker.postMessage(
    serialize({
      signal: WorkerSignal.Data,
      response
    })
  );
};

/**
 * Notify an event signal message to the main worker.
 *
 * @param worker Worker instace.
 * @param provider Provider to be notified.
 * @param event Event name.
 * @param payload Event payload.
 */
export const notifyEvent = (worker: MessagePort, provider: string, event: string, payload?: AnyObject) => {
  worker.postMessage(
    serialize({
      signal: WorkerSignal.Event,
      provider,
      payload,
      event
    })
  );
};

/**
 * Notify a log message to the main worker.
 *
 * @param worker Worker instance.
 * @param error Determines whether or not the log is an error
 * @param text Log text.
 */
export const notifyLog = (worker: MessagePort, error: boolean, text: string) => {
  worker.postMessage(
    serialize({
      signal: WorkerSignal.Log,
      error,
      text
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
