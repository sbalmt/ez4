import type { ServiceEmulators } from '../service';
import type { ServiceEmulator } from '../types';

export const prepareServices = (emulators: ServiceEmulators) => {
  return forEachEmulator(emulators, async (emulator) => {
    if (emulator.prepareHandler) {
      await emulator.prepareHandler();
    }
  });
};

export const bootstrapServices = (emulators: ServiceEmulators) => {
  return forEachEmulator(emulators, async (emulator) => {
    if (emulator.bootstrapHandler) {
      await emulator.bootstrapHandler();
    }
  });
};

export const shutdownServices = (emulators: ServiceEmulators) => {
  return forEachEmulator(emulators, async (emulator) => {
    if (emulator.shutdownHandler) {
      await emulator.shutdownHandler();
    }
  });
};

const forEachEmulator = async (emulators: ServiceEmulators, callback: (emulator: ServiceEmulator) => Promise<void>) => {
  for (const identifier in emulators) {
    await callback(emulators[identifier]);
  }
};
