import type { ServiceFactories, ServiceReferences } from './types/service';
import type { FunctionCallback } from './types/function';
import type { ModuleInvoker } from './types/module';

import { parentPort } from 'node:worker_threads';

import { captureOutput } from './worker/output';
import { invokeHandler } from './worker/handler';
import { resolveReply, rejectReply } from './worker/event';
import { notifyError, notifyData } from './worker/notifier';
import { loadLocalFunction, loadLocalService } from './worker/loader';
import { WorkerNotInitializedError, WorkerUnavailableError } from './errors/worker';
import { UnexpectedSignalError } from './errors/signal';
import { WorkerSignal } from './types/signal';
import { getLazyContext } from './utils/context';
import { deserialize } from './utils/data';

const hostWorker = parentPort;
const references: ServiceReferences = {};
const services: ServiceFactories = {};

let invoker: ModuleInvoker;
let listener: FunctionCallback | undefined;
let handler: FunctionCallback | undefined;

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

          services[identifier] = await loadLocalService(hostWorker, services, service);
        }

        invoker = await loadLocalService(hostWorker, services, signal.invoker);
        listener = signal.listener && (await loadLocalFunction(signal.listener));
        handler = await loadLocalFunction(signal.handler);

        timeout = signal.timeout * 1000;

        notifyData(hostWorker, undefined);
        break;
      }

      case WorkerSignal.Invoke: {
        if (!handler) {
          throw new WorkerNotInitializedError();
        }

        const context = getLazyContext(services, references);

        await invokeHandler(hostWorker, handler, listener, invoker, context, signal.request, timeout);
        break;
      }

      case WorkerSignal.Data: {
        if (signal.id) {
          resolveReply(signal.id, signal.response);
        }
        break;
      }

      case WorkerSignal.Error: {
        if (signal.id) {
          rejectReply(signal.id, signal.error);
        }
        break;
      }

      default:
        throw new UnexpectedSignalError(signal.signal);
    }
  } catch (error) {
    notifyError(hostWorker, error);
  }
});
