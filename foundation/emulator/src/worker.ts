import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from './types/function';
import type { ModuleManager } from './types/module';

import { parentPort } from 'node:worker_threads';

import { invokeHandler } from './worker/handler';
import { captureOutput } from './worker/output';
import { loadFunction, loadService } from './worker/loader';
import { notifyError, notifyResult } from './worker/notifier';
import { WorkerNotInitializedError, WorkerUnavailableError } from './errors/worker';
import { UnexpectedSignalError } from './errors/signal';
import { WorkerSignal } from './types/signal';
import { deserialize } from './utils/data';

const hostWorker = parentPort;

let listener: FunctionCallback | undefined;
let handler: FunctionCallback | undefined;

let services: AnyObject = {};
let manager: ModuleManager;

if (!hostWorker) {
  throw new WorkerUnavailableError();
}

captureOutput(hostWorker, false, process.stdout);
captureOutput(hostWorker, true, process.stderr);

hostWorker.on('message', async (message: string) => {
  try {
    const signal = deserialize(message);

    switch (signal.signal) {
      case WorkerSignal.Start: {
        for (const identifier in signal.services) {
          services[identifier] = await loadService(hostWorker, services, signal.services[identifier]);
        }

        manager = await loadService(hostWorker, services, signal.manager);

        listener = signal.listener && (await loadFunction(signal.listener));
        handler = await loadFunction(signal.handler);

        notifyResult(hostWorker, undefined);
        break;
      }

      case WorkerSignal.Invoke: {
        if (!handler) {
          throw new WorkerNotInitializedError();
        }

        await invokeHandler(hostWorker, handler, listener, manager, services, signal.request);
        break;
      }

      default:
        throw new UnexpectedSignalError(signal.signal);
    }
  } catch (error) {
    notifyError(hostWorker, error);
  }
});
