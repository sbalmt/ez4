import type { EmulatorLinkedServices, ServiceEmulator, EmulatorServiceClients } from './types';
import type { MetadataReflection } from '../types/metadata';
import type { ServeOptions } from '../types/options';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { MissingEmulatorProvider } from './errors';

export type ServiceEmulators = Record<string, ServiceEmulator>;

export const getServiceEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const emulators: ServiceEmulators = {};

  const context = {
    makeClients: (linkedServices: EmulatorLinkedServices) => {
      return makeEmulatorClients(linkedServices, emulators, options);
    },
    makeClient: (resourceName: string) => {
      return makeEmulatorClient(resourceName, emulators, options);
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

const makeEmulatorClients = async (linkedServices: EmulatorLinkedServices, emulators: ServiceEmulators, options: ServeOptions) => {
  const allClients: EmulatorServiceClients = {};

  for (const linkedServiceName in linkedServices) {
    const serviceName = linkedServices[linkedServiceName];

    allClients[linkedServiceName] = await makeEmulatorClient(serviceName, emulators, options);
  }

  return allClients;
};

const makeEmulatorClient = async (resourceName: string, emulators: ServiceEmulators, options: ServeOptions) => {
  const serviceName = getServiceName(resourceName, options);
  const serviceEmulator = emulators[serviceName];

  if (!serviceEmulator) {
    throw new Error(`Service ${resourceName} has no emulators.`);
  }

  const client = await serviceEmulator.exportHandler?.();

  if (!client) {
    throw new Error(`Service ${resourceName} has no client emulator.`);
  }

  return client;
};
