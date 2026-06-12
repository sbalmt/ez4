import type { ServiceEmulators } from '../emulator/service';
import type { ServeOptions } from '../types/options';
import type { ServiceManifest } from './types';

export const getServicesManifest = (emulators: ServiceEmulators, options: ServeOptions) => {
  const manifest: Record<string, ServiceManifest> = {};

  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator?.manifestHandler) {
      manifest[identifier] = {
        host: `${options.serviceHost}/${identifier}`,
        ...emulator.manifestHandler()
      };
    }
  }

  return manifest;
};
