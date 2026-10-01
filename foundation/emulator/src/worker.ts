import type { HandlerFunction } from './process/types';

import { parentPort } from 'node:worker_threads';

import { WorkerNotInitializedError, WorkerUnavailableError } from './worker/errors';
import { deserialize, serialize } from './signals/serializer';
import { UnexpectedSignalError } from './signals/errors';
import { WorkerSignal } from './signals/types';
import { loadHandler } from './worker/loader';

const workerPort = parentPort;

let handler: HandlerFunction | undefined;

if (!workerPort) {
  throw new WorkerUnavailableError();
}

workerPort.on('message', async (message: string) => {
  try {
    const signal = deserialize(message);

    switch (signal.signal) {
      case WorkerSignal.Start: {
        handler = await loadHandler(signal);
        workerPort.postMessage(serialize({ signal: WorkerSignal.Ready }));
        break;
      }

      case WorkerSignal.Invoke: {
        if (!handler) {
          throw new WorkerNotInitializedError();
        }

        const output = await handler(...signal.inputs);

        workerPort.postMessage(serialize({ signal: WorkerSignal.Result, output }));
        break;
      }

      default:
        throw new UnexpectedSignalError(signal.signal);
    }
  } catch (error) {
    workerPort.postMessage(
      serialize({
        signal: WorkerSignal.Error,
        error: serializeError(error)
      })
    );
  }
});

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    const errorType = Object.getPrototypeOf(error);
    const errorClass = errorType?.constructor;
    const errorName = errorClass?.name;

    return {
      name: errorName,
      message: error.message,
      stack: error.stack
    };
  }

  return {
    name: 'Error',
    message: String(error)
  };
};
