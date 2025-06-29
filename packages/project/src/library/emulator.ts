import type { EmulateServiceContext, EmulatorService } from '../types/emulator.js';
import type { MetadataReflection } from '../types/metadata.js';
import type { ServeOptions } from '../types/options.js';

import { getServiceName, triggerAllSync } from '@ez4/project/library';

export type EmulatorServices = Record<string, EmulatorService>;

export const getEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const emulators: EmulatorServices = {};

  const context = createEmulatorContext(emulators, options);

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

const createEmulatorContext = (emulators: EmulatorServices, options: ServeOptions): EmulateServiceContext => {
  return {
    makeClient: (serviceName: string) => {
      const identifier = getServiceName(serviceName, options);
      const service = emulators[identifier];

      if (!service) {
        throw new Error(`Service ${serviceName} has no emulators.`);
      }

      const client = service.clientMaker();

      if (!client) {
        throw new Error(`Service ${serviceName} has no client emulator.`);
      }

      return client;
    }
  };
};
