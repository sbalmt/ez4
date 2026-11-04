import type { FunctionCallback, FunctionSource } from '../types/function';
import type { AnyServiceDescriptor, ServiceFactories } from '../types/service';
import type { ProviderContext } from '../types/provider';

import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

import { ServiceNotFoundError } from '../errors/handler';

export const loadFunction = async (source: FunctionSource, workspacePath: string) => {
  const specifier = getSpecifier(source, workspacePath);

  const { [source.name]: callback } = await import(specifier);

  return {
    callback: callback as FunctionCallback,
    specifier
  };
};

export const loadService = async <T>(
  services: ServiceFactories,
  descriptor: AnyServiceDescriptor,
  workspacePath: string,
  makeContext: (provider: string) => Omit<ProviderContext, 'services' | 'workspacePath'>
) => {
  const { specifier, callback } = await loadFunction(descriptor, workspacePath);

  if (typeof callback !== 'function') {
    throw new ServiceNotFoundError(descriptor.name, descriptor);
  }

  const provider = descriptor.provider ?? specifier;

  return callback<T>(descriptor.options, {
    ...makeContext(provider),
    workspacePath,
    services
  });
};

const getSpecifier = (source: FunctionSource, workspacePath: string) => {
  if ('module' in source) {
    return source.module;
  }

  const path = resolve(workspacePath, source.file);
  const url = pathToFileURL(path);

  return url.href;
};
