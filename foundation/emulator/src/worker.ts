import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from './types/common';
import type { ModuleManager } from './types/module';

import { parentPort } from 'node:worker_threads';

import { invokeHandler } from './worker/invoker';
import { notifyError, notifyResult } from './worker/notifier';
import { loadFunction, loadServices, loadService } from './worker/loader';
import { WorkerNotInitializedError, WorkerUnavailableError } from './errors/worker';
import { UnexpectedSignalError } from './errors/signal';
import { WorkerSignal } from './types/signal';
import { deserialize } from './utils/data';

const workerPort = parentPort;

let listener: FunctionCallback | undefined;
let handler: FunctionCallback | undefined;

let context: AnyObject = {};
let manager: ModuleManager;

if (!workerPort) {
  throw new WorkerUnavailableError();
}

workerPort.on('message', async (message: string) => {
  try {
    const signal = deserialize(message);

    switch (signal.signal) {
      case WorkerSignal.Start: {
        manager = await loadService(signal.manager);
        context = await loadServices(signal.services);

        listener = signal.listener && (await loadFunction(signal.listener));
        handler = await loadFunction(signal.handler);

        notifyResult(workerPort, undefined);
        break;
      }

      case WorkerSignal.Invoke: {
        if (!handler) {
          throw new WorkerNotInitializedError();
        }

        await invokeHandler(workerPort, handler, listener, manager, context, signal.request);
        break;
      }

      default:
        throw new UnexpectedSignalError(signal.signal);
    }
  } catch (error) {
    notifyError(workerPort, error);
  }
});
