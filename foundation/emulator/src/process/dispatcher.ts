import type { Worker } from 'node:worker_threads';
import type { WorkerErrorSignal, WorkerEventSignal, WorkerLogSignal, WorkerSignals } from '../types/signal';

import { isAnyObject } from '@ez4/utils';

import { UnexpectedSignalError } from '../errors/signal';
import { WorkerMemoryLimitError, WorkerTerminatedError } from '../errors/worker';
import { EntrypointNotFoundError, ServiceNotFoundError } from '../errors/handler';
import { getErrorData, logErrorData } from '../utils/errors';
import { deserialize, serialize } from '../utils/data';
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
          default: {
            onError(new UnexpectedSignalError(data.signal));
            break;
          }

          case WorkerSignal.Log: {
            handleLog(data);
            break;
          }

          case WorkerSignal.Event: {
            handleEvent(worker, data).catch(logErrorData);
            break;
          }

          case WorkerSignal.Data: {
            cleanupListeners();
            resolve(data.response);
            break;
          }

          case WorkerSignal.Error: {
            onError(handleError(data));
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

const handleLog = ({ error, text }: WorkerLogSignal) => {
  const output = error ? process.stderr : process.stdout;

  output.write(text);
};

const handleEvent = async (worker: Worker, { provider, event, payload, id }: WorkerEventSignal) => {
  if (!id) {
    await notifyProvider(provider, event, payload);
    return;
  }

  try {
    const response = await notifyProvider(provider, event, payload);
    sendReply(worker, id, response);
  } catch (error) {
    sendError(worker, id, error);
  }
};

const handleError = ({ error: data }: WorkerErrorSignal) => {
  const error = isServiceError(data)
    ? new ServiceNotFoundError(data.message)
    : isEntrypointError(data)
      ? new EntrypointNotFoundError(data.message)
      : new Error(data.message);

  error.stack = data.stack;

  return error;
};

const sendReply = (worker: Worker, id: string, response: unknown) => {
  worker.postMessage(
    serialize({
      signal: WorkerSignal.Data,
      response,
      id
    })
  );
};

const sendError = (worker: Worker, id: string, error: unknown) => {
  worker.postMessage(
    serialize({
      signal: WorkerSignal.Error,
      error: getErrorData(error),
      id
    })
  );
};
