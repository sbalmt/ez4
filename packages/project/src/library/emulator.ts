import type { EmulatorService } from '../types/emulator.js';
import type { MetadataReflection } from '../types/metadata.js';
import type { ServeOptions } from '../types/options.js';

import { getServiceName, triggerAllSync } from '@ez4/project/library';

export type EmulatorServices = Record<string, EmulatorService>;

export const getEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const emulators: EmulatorServices = {};

  const context = {
    makeAllClients: (serviceNames: string[]) => {
      return makeAllEmulatorClients(serviceNames, emulators, options);
    },
    makeClient: (serviceName: string) => {
      return makeEmulatorClient(serviceName, emulators, options);
    }
  };

  for (const identity in metadata) {
    const service = metadata[identity];

    triggerAllSync('emulator:getServices', (handler) => {
      const result = handler({ service, options, context });

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

const makeAllEmulatorClients = (serviceNames: string[], emulators: EmulatorServices, options: ServeOptions) => {
  const allClients: Record<string, unknown> = {};

  for (const serviceName of serviceNames) {
    allClients[serviceName] = makeEmulatorClient(serviceName, emulators, options);
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
