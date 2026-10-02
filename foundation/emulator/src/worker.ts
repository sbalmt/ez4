import type { FunctionCallback } from './worker/types';

import { parentPort } from 'node:worker_threads';

import { invokeHandler } from './worker/invoker';
import { notifyError, notifyResult } from './worker/notifier';
import { WorkerNotInitializedError, WorkerUnavailableError } from './worker/errors';
import { UnexpectedSignalError } from './signals/errors';
import { deserialize } from './signals/serializer';
import { WorkerSignal } from './signals/types';
import { loadFunction } from './worker/loader';

const workerPort = parentPort;

let listener: FunctionCallback | undefined;
let handler: FunctionCallback | undefined;

const context = {};

if (!workerPort) {
  throw new WorkerUnavailableError();
}

workerPort.on('message', async (message: string) => {
  try {
    const signal = deserialize(message);

    switch (signal.signal) {
      case WorkerSignal.Start: {
        listener = signal.listener && (await loadFunction(signal.listener));
        handler = await loadFunction(signal.handler);

        notifyResult(workerPort, undefined);
        break;
      }

      case WorkerSignal.Invoke: {
        if (!handler) {
          throw new WorkerNotInitializedError();
        }

        await invokeHandler(workerPort, handler, listener, context, signal.request);
        break;
      }

      default:
        throw new UnexpectedSignalError(signal.signal);
    }
  } catch (error) {
    notifyError(workerPort, error);
  }
});
