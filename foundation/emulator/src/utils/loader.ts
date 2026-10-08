import type { FunctionCallback, FunctionSource } from '../types/function';
import type { AnyServiceDescriptor, ServiceFactories } from '../types/service';
import type { ProviderContext } from '../types/provider';

import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

import { ServiceNotFoundError } from '../errors/handler';

export const loadFunction = async (source: FunctionSource) => {
  const specifier = 'module' in source ? source.module : pathToFileURL(join(process.cwd(), source.file)).href;

  const { [source.name]: callback } = await import(specifier);

  return {
    callback: callback as FunctionCallback,
    specifier
  };
};

export const loadService = async <T>(
  services: ServiceFactories,
  descriptor: AnyServiceDescriptor,
  makeContext: (provider: string) => Omit<ProviderContext, 'services'>
) => {
  const { specifier, callback } = await loadFunction(descriptor);

  if (typeof callback !== 'function') {
    throw new ServiceNotFoundError(descriptor.name, descriptor);
  }

  const provider = descriptor.provider ?? specifier;

  return callback<T>(descriptor.options, {
    ...makeContext(provider),
    services
  });
};
