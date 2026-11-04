import type { MessagePort } from 'node:worker_threads';
import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from '../types/function';
import type { AnyServiceDescriptor, ServiceFactories } from '../types/service';
import type { WorkerEntrypoint } from '../types/worker';

import { EntrypointNotFoundError } from '../errors/handler';
import { loadFunction, loadService } from '../process/loader';
import { notifyEvent, requestEvent } from './notifier';

export const loadLocalFunction = async (entrypoint: WorkerEntrypoint, workspacePath: string): Promise<FunctionCallback> => {
  const { callback } = await loadFunction(entrypoint, workspacePath);

  if (typeof callback !== 'function') {
    throw new EntrypointNotFoundError(entrypoint.name, entrypoint.file);
  }

  return callback as FunctionCallback;
};

export const loadLocalService = <T>(
  worker: MessagePort,
  services: ServiceFactories,
  descriptor: AnyServiceDescriptor,
  workspacePath: string
) => {
  return loadService<T>(services, descriptor, workspacePath, (provider) => ({
    notify: (event: string, payload: AnyObject) => {
      notifyEvent(worker, provider, event, payload);
    },
    request: (event: string, payload: AnyObject) => {
      return requestEvent(worker, provider, event, payload);
    }
  }));
};
