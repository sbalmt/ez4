import type { MessagePort } from 'node:worker_threads';
import type { AnyObject } from '@ez4/utils';
import type { FunctionCallback } from '../types/handler';
import type { ServiceAnyDescriptor, ServiceDescriptors } from '../types/service';
import type { WorkerEntrypoint } from '../types/worker';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { EntrypointNotFoundError, ServiceNotFoundError } from '../errors/handler';
import { notifyEvent } from './notifier';

export const loadFunction = async (entrypoint: WorkerEntrypoint): Promise<FunctionCallback> => {
  const moduleUrl = entrypoint.module ? entrypoint.module : pathToFileURL(join(process.cwd(), entrypoint.file)).href;

  const { [entrypoint.name]: callback } = await import(moduleUrl);

  if (typeof callback !== 'function') {
    throw new EntrypointNotFoundError(entrypoint.name, entrypoint.file);
  }

  return callback as FunctionCallback;
};

export const loadService = async (worker: MessagePort, descriptor: ServiceAnyDescriptor) => {
  const specifier = 'module' in descriptor ? descriptor.module : pathToFileURL(join(process.cwd(), descriptor.file)).href;

  const { [descriptor.name]: callback } = await import(specifier);

  if (typeof callback !== 'function') {
    throw new ServiceNotFoundError(descriptor.name, descriptor);
  }

  const provider = descriptor.provider ?? specifier;

  return callback(descriptor.options, {
    notify: (event: string, payload: AnyObject) => {
      notifyEvent(worker, provider, event, payload);
    }
  });
};

export const loadServices = async (worker: MessagePort, descriptors: ServiceDescriptors) => {
  const services: AnyObject = {};

  for (const identifier in descriptors) {
    const service = await loadService(worker, descriptors[identifier]);

    services[identifier] = service;
  }

  return services;
};
