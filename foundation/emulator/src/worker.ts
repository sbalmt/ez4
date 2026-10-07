import type { ServiceFactories, ServiceReferences } from './types/service';
import type { FunctionCallback } from './types/function';
import type { ModuleManager } from './types/module';

import { parentPort } from 'node:worker_threads';

import { captureOutput } from './worker/output';
import { invokeHandler } from './worker/handler';
import { loadFunction, loadService } from './worker/loader';
import { notifyError, notifyResult } from './worker/notifier';
import { WorkerNotInitializedError, WorkerUnavailableError } from './errors/worker';
import { UnexpectedSignalError } from './errors/signal';
import { WorkerSignal } from './types/signal';
import { getLazyContext } from './utils/context';
import { deserialize } from './utils/data';

const hostWorker = parentPort;
const references: ServiceReferences = {};
const services: ServiceFactories = {};

let listener: FunctionCallback | undefined;
let handler: FunctionCallback | undefined;

let manager: ModuleManager;
let timeout: number;

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
        Object.assign(references, signal.references);

        for (const identifier in signal.services) {
          const service = signal.services[identifier];

          services[identifier] = await loadService(hostWorker, services, service);
        }

        manager = await loadService(hostWorker, services, signal.manager);
        timeout = signal.timeout * 1000;

        listener = signal.listener && (await loadFunction(signal.listener));
        handler = await loadFunction(signal.handler);

        notifyResult(hostWorker, undefined);
        break;
      }

      case WorkerSignal.Invoke: {
        if (!handler) {
          throw new WorkerNotInitializedError();
        }

        const context = getLazyContext(services, references);

        await invokeHandler(hostWorker, handler, listener, manager, context, signal.request, timeout);
        break;
      }

      default:
        throw new UnexpectedSignalError(signal.signal);
    }
  } catch (error) {
    notifyError(hostWorker, error);
  }
});
