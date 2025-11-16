import type { LinkedServiceEmulators, ServiceEmulator, ServiceEmulatorClients } from './types';
import type { MetadataReflection } from '../types/metadata';
import type { ServeOptions } from '../types/options';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { MissingEmulatorProvider } from '../errors/provider';

export type ServiceEmulators = Record<string, ServiceEmulator>;

export const getServiceEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const emulators: ServiceEmulators = {};

  const context = {
    makeClients: (linkedServices: LinkedServiceEmulators) => {
      return makeEmulatorClients(linkedServices, emulators, options);
    },
    makeClient: (serviceName: string) => {
      return makeEmulatorClient(serviceName, emulators, options);
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

const makeEmulatorClients = (linkedServices: LinkedServiceEmulators, emulators: ServiceEmulators, options: ServeOptions) => {
  const allClients: ServiceEmulatorClients = {};

  for (const linkedServiceName in linkedServices) {
    const serviceName = linkedServices[linkedServiceName];

    allClients[linkedServiceName] = makeEmulatorClient(serviceName, emulators, options);
  }

  return allClients;
};

const makeEmulatorClient = (serviceName: string, emulators: ServiceEmulators, options: ServeOptions) => {
  const identifier = getServiceName(serviceName, options);
  const service = emulators[identifier];

  if (!service) {
    throw new Error(`Service ${serviceName} has no emulators.`);
  }

  const client = service.exportHandler?.();

  if (!client) {
    throw new Error(`Service ${serviceName} has no client emulator.`);
  }

  return client;
};
