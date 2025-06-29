import type { EmulatorService } from '../types/emulator.js';
import type { MetadataReflection } from '../types/metadata.js';
import type { ServeOptions } from '../types/options.js';

import { triggerAllSync } from '@ez4/project/library';

export type EmulatorServices = Record<string, EmulatorService>;

export const getEmulators = async (metadata: MetadataReflection, options: ServeOptions) => {
  const emulators: EmulatorServices = {};

  for (const identity in metadata) {
    const service = metadata[identity];

    triggerAllSync('emulator:getServices', (handler) => {
      const result = handler({ service, options });

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
