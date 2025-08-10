import type { EmulatorServices } from '../library/emulator.js';

import { getServiceName } from './service.js';

type TesterContext = {
  emulators?: EmulatorServices;
  options?: TesterOptions;
};

type TesterOptions = {
  resourcePrefix: string;
  projectName: string;
};

export namespace Tester {
  const Context: TesterContext = {};

  const ensureContext = (context: TesterContext): context is Required<TesterContext> => {
    return !!context.options && !!context.emulators;
  };

  export const configure = (emulators: EmulatorServices, options: TesterOptions) => {
    if (Context.emulators) {
      throw new Error('Tester is already configured.');
    }

    Object.assign(Context, {
      emulators,
      options
    });
  };

  export const getServiceClient = (resourceName: string) => {
    if (!ensureContext(Context)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceName(resourceName, Context.options);
    const serviceEmulator = Context.emulators[serviceName];

    if (!serviceEmulator) {
      throw new Error(`Emulator for resource ${resourceName} not found.`);
    }

    if (!serviceEmulator.clientHandler) {
      throw new Error(`Resource ${resourceName} doesn't provide any service client.`);
    }

    return serviceEmulator.clientHandler();
  };
}
