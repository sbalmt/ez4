import type { EmulatorLinkedServices, EmulatorService, EmulatorServiceClients } from '../types/emulator.js';
import type { MetadataReflection } from '../types/metadata.js';
import type { ServeOptions } from '../types/options.js';

import { getServiceName, triggerAllAsync } from '@ez4/project/library';

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

    await triggerAllAsync('emulator:getServices', async (handler) => {
      const result = await handler({ service, options, context });

      if (result) {
        emulators[result.identifier] = result;
      }

      return null;
    });
  }

  return {
    emulators
  };
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
