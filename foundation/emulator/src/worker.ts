import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from './types/handler';
import type { ModuleManager } from './types/module';

import { parentPort } from 'node:worker_threads';

import { invokeHandler } from './worker/handler';
import { notifyError, notifyResult } from './worker/notifier';
import { loadFunction, loadServices, loadService } from './worker/loader';
import { WorkerNotInitializedError, WorkerUnavailableError } from './errors/worker';
import { UnexpectedSignalError } from './errors/signal';
import { WorkerSignal } from './types/signal';
import { deserialize } from './utils/data';

const hostWorker = parentPort;

let listener: FunctionCallback | undefined;
let handler: FunctionCallback | undefined;

let context: AnyObject = {};
let manager: ModuleManager;

if (!hostWorker) {
  throw new WorkerUnavailableError();
}

hostWorker.on('message', async (message: string) => {
  try {
    const signal = deserialize(message);

    switch (signal.signal) {
      case WorkerSignal.Start: {
        manager = await loadService(hostWorker, signal.manager);
        context = await loadServices(hostWorker, signal.services);

        listener = signal.listener && (await loadFunction(signal.listener));
        handler = await loadFunction(signal.handler);

        notifyResult(hostWorker, undefined);
        break;
      }

      case WorkerSignal.Invoke: {
        if (!handler) {
          throw new WorkerNotInitializedError();
        }

        await invokeHandler(hostWorker, handler, listener, manager, context, signal.request);
        break;
      }

      default:
        throw new UnexpectedSignalError(signal.signal);
    }
  } catch (error) {
    notifyError(hostWorker, error);
  }
});
