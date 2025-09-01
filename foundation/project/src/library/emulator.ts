import type { EmulatorLinkedServices, EmulatorService, EmulatorServiceClients } from '../types/emulator';
import type { MetadataReflection } from '../types/metadata';
import type { ServeOptions } from '../types/options';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

import { MissingEmulatorProvider } from '../errors/provider';

export type EmulatorServices = Record<string, EmulatorService>;

export const getEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const emulators: EmulatorServices = {};

  const context = {
    makeClients: (linkedServices: EmulatorLinkedServices) => {
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

const makeEmulatorClients = (linkedServices: EmulatorLinkedServices, emulators: EmulatorServices, options: ServeOptions) => {
  const allClients: EmulatorServiceClients = {};

  for (const linkedServiceName in linkedServices) {
    const serviceName = linkedServices[linkedServiceName];

    allClients[linkedServiceName] = makeEmulatorClient(serviceName, emulators, options);
  }

  return allClients;
};

const makeEmulatorClient = (serviceName: string, emulators: EmulatorServices, options: ServeOptions) => {
  const identifier = getServiceName(serviceName, options);
  const service = emulators[identifier];

  if (!service) {
    throw new Error(`Service ${serviceName} has no emulators.`);
  }

  const client = service.clientHandler?.();

  if (!client) {
    throw new Error(`Service ${serviceName} has no client emulator.`);
  }

  return client;
};
