import type { ServiceEmulators } from './service';

import { getServiceName } from '../utils/service';
import { EmulatorClientNotFoundError, EmulatorNotFoundError } from './errors';

type TesterContext = {
  mocks?: ServiceEmulators;
  emulators?: ServiceEmulators;
  options?: TesterOptions;
};

type TesterOptions = {
  resourcePrefix: string;
  projectName: string;
};

export namespace Tester {
  const CONTEXT: TesterContext = {};

  const ensureContext = (context: TesterContext): context is Required<TesterContext> => {
    return !!context.options && !!context.emulators;
  };

  export type Options = TesterOptions;

  export const configure = (emulators: ServiceEmulators, options: Options) => {
    if (CONTEXT.emulators) {
      throw new Error('Tester is already configured.');
    }

    Object.assign(CONTEXT, {
      mocks: {},
      emulators,
      options
    });
  };

  export const getServiceClient = (resourceName: string): Promise<unknown> | unknown => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceName(resourceName, CONTEXT.options);
    const serviceEmulator = CONTEXT.mocks[serviceName] ?? CONTEXT.emulators[serviceName];

    if (!serviceEmulator) {
      throw new EmulatorNotFoundError(resourceName);
    }

    if (!serviceEmulator.exportHandler) {
      throw new EmulatorClientNotFoundError(resourceName);
    }

    return serviceEmulator.exportHandler();
  };

  export const mockServiceClient = (resourceName: string, client: unknown) => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceName(resourceName, CONTEXT.options);

    CONTEXT.mocks[serviceName] = {
      type: 'Mock',
      name: resourceName,
      identifier: serviceName,
      exportHandler: () => client
    };
  };

  export const restoreServiceClient = (resourceName: string) => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceName(resourceName, CONTEXT.options);
    const serviceEmulator = CONTEXT.mocks[serviceName];

    if (!serviceEmulator) {
      throw new EmulatorNotFoundError(resourceName);
    }

    delete CONTEXT.mocks[serviceName];
  };
}
