import type { EmulatorService } from '../types/emulator.js';
import type { MetadataReflection } from '../types/metadata.js';
import type { ProjectOptions } from '../types/project.js';

import { triggerAllSync } from '@ez4/project/library';

export type EmulatorServices = Record<string, EmulatorService>;

export const getEmulators = async (metadata: MetadataReflection, options: ProjectOptions) => {
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
