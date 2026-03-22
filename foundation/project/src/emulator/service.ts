import type { EmulatorLinkedServices, ServiceEmulator, EmulatorServiceClients } from './types';
import type { MetadataReflection } from '../types/metadata';
import type { ServeOptions } from '../types/options';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { MissingEmulatorProvider } from './errors';

export type ServiceEmulators = Record<string, ServiceEmulator>;

export const getServiceEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const resolutionCache = new WeakMap<symbol, EmulatorServiceClients>();
  const emulators: ServiceEmulators = {};

  const context = {
    makeClient: (resourceName: string) => {
      return makeEmulatorClient(resourceName, emulators, options);
    },
    makeClients: async (linkedServices: EmulatorLinkedServices, cacheToken = Symbol()) => {
      const clientsCache = resolutionCache.get(cacheToken);

      if (!clientsCache) {
        const allClients = {};

        resolutionCache.set(cacheToken, allClients);

        Object.assign(allClients, await makeEmulatorClients(linkedServices, emulators, options, cacheToken));

        return allClients;
      }

      return clientsCache;
    }
  };

  for (const identity in metadata) {
    const service = metadata[identity];

    const result = await triggerAllAsync('emulator:getServices', (handler) =>
      handler({
        service,
        options,
        context
      })
    );

    if (!result) {
      throw new MissingEmulatorProvider(service.name);
    }

    if (result) {
      emulators[result.identifier] = result;
    }
  }

  return emulators;
};

const makeEmulatorClients = async (
  linkedServices: EmulatorLinkedServices,
  emulators: ServiceEmulators,
  options: ServeOptions,
  cacheToken: symbol
) => {
  const allClients: EmulatorServiceClients = {};

  for (const linkedServiceName in linkedServices) {
    const serviceName = linkedServices[linkedServiceName];

    const client = await makeEmulatorClient(serviceName, emulators, options, cacheToken);

    allClients[linkedServiceName] = client;
  }

  return allClients;
};

const makeEmulatorClient = async (resourceName: string, emulators: ServiceEmulators, options: ServeOptions, cacheToken?: symbol) => {
  const serviceName = getServiceName(resourceName, options);
  const serviceEmulator = emulators[serviceName];

  if (!serviceEmulator) {
    throw new Error(`Service ${resourceName} has no emulators.`);
  }

  const client = await serviceEmulator.exportHandler?.(cacheToken);

  if (!client) {
    throw new Error(`Service ${resourceName} has no client emulator.`);
  }

  return client;
};
