import type { ServiceEmulators } from './utils';
import type { ServiceEmulator } from './types';

export const prepareServices = async (emulators: ServiceEmulators) => {
  await forEachEmulator(emulators, async (emulator) => {
    if (emulator.prepareHandler) {
      await emulator.prepareHandler();
    }
  });
};

export const bootstrapServices = async (emulators: ServiceEmulators) => {
  await forEachEmulator(emulators, async (emulator) => {
    if (emulator.bootstrapHandler) {
      await emulator.bootstrapHandler();
    }
  });
};

export const shutdownServices = async (emulators: ServiceEmulators) => {
  await forEachEmulator(emulators, async (emulator) => {
    if (emulator.shutdownHandler) {
      await emulator.shutdownHandler();
    }
  });
};

const forEachEmulator = async (emulators: ServiceEmulators, callback: (emulator: ServiceEmulator) => Promise<void>) => {
  process.env.EZ4_IS_LOCAL = 'true';

  for (const identifier in emulators) {
    await callback(emulators[identifier]);
  }
};
