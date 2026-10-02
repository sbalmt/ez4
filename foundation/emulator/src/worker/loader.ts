import type { AnyObject } from '@ez4/utils';
import type { ServiceAnyDescriptor, ServiceDescriptors } from '../types/service';
import type { WorkerEntrypoint } from '../types/worker';
import type { FunctionCallback } from '../types/common';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { EntrypointNotFoundError, ServiceNotFoundError } from '../errors/handler';

export const loadFunction = async (entrypoint: WorkerEntrypoint): Promise<FunctionCallback> => {
  const moduleUrl = entrypoint.module ? entrypoint.module : pathToFileURL(join(process.cwd(), entrypoint.file)).href;

  const { [entrypoint.name]: callback } = await import(moduleUrl);

  if (typeof callback !== 'function') {
    throw new EntrypointNotFoundError(entrypoint.name, entrypoint.file);
  }

  return callback as FunctionCallback;
};

export const loadService = async (descriptor: ServiceAnyDescriptor) => {
  const specifier = 'module' in descriptor ? descriptor.module : pathToFileURL(join(process.cwd(), descriptor.file)).href;

  const { [descriptor.name]: callback } = await import(specifier);

  if (typeof callback !== 'function') {
    throw new ServiceNotFoundError(descriptor.name, descriptor);
  }

  return callback(descriptor.options);
};

export const loadServices = async (descriptors: ServiceDescriptors) => {
  const services: AnyObject = {};

  for (const identifier in descriptors) {
    const service = await loadService(descriptors[identifier]);

    services[identifier] = service;
  }

  return services;
};
