import type { MessagePort } from 'node:worker_threads';
import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from '../types/function';
import type { AnyServiceDescriptor, ServiceFactories } from '../types/service';
import type { WorkerEntrypoint } from '../types/worker';

import { EntrypointNotFoundError } from '../errors/handler';
import { loadFunction, loadService } from '../utils/loader';
import { notifyEvent, requestEvent } from './notifier';

export const loadLocalFunction = async (entrypoint: WorkerEntrypoint): Promise<FunctionCallback> => {
  const { callback } = await loadFunction(entrypoint);

  if (typeof callback !== 'function') {
    throw new EntrypointNotFoundError(entrypoint.name, entrypoint.file);
  }

  return callback as FunctionCallback;
};

export const loadLocalService = <T>(worker: MessagePort, services: ServiceFactories, descriptor: AnyServiceDescriptor) => {
  return loadService<T>(services, descriptor, (provider) => ({
    notify: (event: string, payload: AnyObject) => {
      notifyEvent(worker, provider, event, payload);
    },
    request: (event: string, payload: AnyObject) => {
      return requestEvent(worker, provider, event, payload);
    }
  }));
};
