import type { AnyObject } from '@ez4/utils';
import type { ProviderOptions } from '../types/provider';

import { DuplicateProviderError, MissingProviderError } from '../errors/provider';

const ALL_PROVIDERS = new Map<string, ProviderOptions<AnyObject>>();

export const registerProvider = <T extends AnyObject>(name: string, options: ProviderOptions<T>) => {
  if (ALL_PROVIDERS.has(name)) {
    throw new DuplicateProviderError(name);
  }

  ALL_PROVIDERS.set(name, {
    ...options
  });
};

export const unregisterProvider = (name: string) => {
  if (!ALL_PROVIDERS.delete(name)) {
    throw new MissingProviderError(name);
  }
};

export const notifyProvider = async <T extends AnyObject>(name: string, event: string, payload: T | undefined) => {
  const provider = ALL_PROVIDERS.get(name);

  if (!provider) {
    throw new MissingProviderError(name);
  }

  const { eventTypes, eventHandler } = provider;

  if (eventTypes.includes(event)) {
    const response = await eventHandler(event, payload);

    return response;
  }

  return Promise.resolve();
};
