import type { EmulatorServices } from '../library/emulator';
import type { EmulatorService } from '../types/emulator';

export const prepareServices = async (emulators: EmulatorServices) => {
  await forEachEmulator(emulators, async (emulator) => {
    if (emulator.prepareHandler) {
      await emulator.prepareHandler();
    }
  });
};

export const bootstrapServices = async (emulators: EmulatorServices) => {
  await forEachEmulator(emulators, async (emulator) => {
    if (emulator.bootstrapHandler) {
      await emulator.bootstrapHandler();
    }
  });
};

export const shutdownServices = async (emulators: EmulatorServices) => {
  await forEachEmulator(emulators, async (emulator) => {
    if (emulator.shutdownHandler) {
      await emulator.shutdownHandler();
    }
  });
};

const forEachEmulator = async (emulators: EmulatorServices, callback: (emulator: EmulatorService) => Promise<void>) => {
  process.env.EZ4_IS_LOCAL = 'true';

  for (const identifier in emulators) {
    await callback(emulators[identifier]);
  }
};
