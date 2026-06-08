import type { ServiceManifest } from './types';
import type { ServiceEmulators } from '../emulator/service';

export const getServicesManifest = (emulators: ServiceEmulators) => {
  const manifest: Record<string, ServiceManifest> = {};

  for (const identifier in emulators) {
    const emulator = emulators[identifier];

    if (emulator?.manifestHandler) {
      manifest[identifier] = emulator.manifestHandler();
    }
  }

  return manifest;
};
