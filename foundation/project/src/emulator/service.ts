import type { AnyObject } from '@ez4/utils';
import type { EmulatorLinkedServices, ServiceEmulator, EmulatorServiceClients } from './types';
import type { MetadataReflection } from '../types/metadata';
import type { ServeOptions } from '../types/options';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { MissingEmulatorProvider } from './errors';

export type ServiceEmulators = Record<string, ServiceEmulator>;

export const getServiceEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const scopeCache = new WeakMap<EmulatorLinkedServices, EmulatorServiceClients>();
  const emulators: ServiceEmulators = {};

  const context = {
    makeClient: (resourceName: string, resourceOptions?: AnyObject) => {
      return makeEmulatorClient(resourceName, resourceOptions, emulators, options);
    },
    makeClients: async (linkedServices: EmulatorLinkedServices, linkedOptions?: AnyObject) => {
      const clientsCache = scopeCache.get(linkedServices);

      if (!clientsCache) {
        const allClients = {};

        scopeCache.set(linkedServices, allClients);

        const newClients = await makeEmulatorClients(linkedServices, linkedOptions, emulators, options);

        Object.assign(allClients, newClients);

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
  linkedOptions: AnyObject | undefined,
  emulators: ServiceEmulators,
  options: ServeOptions
) => {
  const allClients: EmulatorServiceClients = {};

  for (const linkedServiceName in linkedServices) {
    const { reference: serviceName, options: serviceOptions } = linkedServices[linkedServiceName];

    const client = await makeEmulatorClient(serviceName, { ...serviceOptions, ...linkedOptions }, emulators, options);

    allClients[linkedServiceName] = client;
  }

  return allClients;
};

const makeEmulatorClient = async (
  resourceName: string,
  resourceOptions: AnyObject | undefined,
  emulators: ServiceEmulators,
  options: ServeOptions
) => {
  const serviceName = getServiceName(resourceName, options);
  const serviceEmulator = emulators[serviceName];

  if (!serviceEmulator) {
    throw new Error(`Service ${resourceName} has no emulators.`);
  }

  const client = await serviceEmulator.exportHandler?.(resourceOptions);

  if (!client) {
    throw new Error(`Service ${resourceName} has no client emulator.`);
  }

  return client;
};
