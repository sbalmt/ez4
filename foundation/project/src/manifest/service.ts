import type { AnyObject } from '@ez4/utils';
import type { ServiceEmulators } from '../emulator/service';
import type { ServeOptions } from '../types/options';
import type { ServiceManifest } from './types';

import { getServiceName } from '../utils/service';

export const getServicesManifest = (emulators: ServiceEmulators, options: ServeOptions) => {
  const manifest: Record<string, ServiceManifest<AnyObject>> = {};

  const namePrefix = getServiceName('', options);

  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator?.manifestHandler) {
      const manifestName = identifier.substring(namePrefix.length + 1);

      manifest[manifestName] = {
        host: `${options.serviceHost}/${identifier}`,
        ...emulator.manifestHandler()
      };
    }
  }

  return manifest;
};
