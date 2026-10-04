import type { MessagePort } from 'node:worker_threads';
import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from '../types/function';
import type { ServiceAnyDescriptor } from '../types/service';
import type { WorkerEntrypoint } from '../types/worker';

import { EntrypointNotFoundError, ServiceNotFoundError } from '../errors/handler';
import { loadCallback } from '../utils/loader';
import { notifyEvent } from './notifier';

export const loadFunction = async (entrypoint: WorkerEntrypoint): Promise<FunctionCallback> => {
  const { callback } = await loadCallback(entrypoint);

  if (typeof callback !== 'function') {
    throw new EntrypointNotFoundError(entrypoint.name, entrypoint.file);
  }

  return callback as FunctionCallback;
};

export const loadService = async <T>(worker: MessagePort, services: AnyObject, descriptor: ServiceAnyDescriptor) => {
  const { specifier, callback } = await loadCallback(descriptor);

  if (typeof callback !== 'function') {
    throw new ServiceNotFoundError(descriptor.name, descriptor);
  }

  const provider = descriptor.provider ?? specifier;

  return callback<T>(descriptor.options, {
    services,
    notify: (event: string, payload: AnyObject) => {
      notifyEvent(worker, provider, event, payload);
    }
  });
};
