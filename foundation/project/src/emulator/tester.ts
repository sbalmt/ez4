import type { ServiceEmulators } from './service';
import type { EmulatorExportHandler } from './types';

import { getServiceName } from '../utils/service';
import { EmulatorClientNotFoundError, EmulatorNotFoundError } from './errors';

type TesterContext = {
  mocks?: Record<string, EmulatorExportHandler | undefined>;
  emulators?: ServiceEmulators;
  options?: TesterOptions;
};

type TesterOptions = {
  prefix: string;
  projectName: string;
  branchName: string;
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
    const serviceEmulator = CONTEXT.emulators[serviceName];

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
    const serviceEmulator = CONTEXT.emulators[serviceName];

    if (!serviceEmulator) {
      throw new EmulatorNotFoundError(resourceName);
    }

    CONTEXT.mocks[serviceName] = serviceEmulator.exportHandler;

    CONTEXT.emulators[serviceName] = {
      ...serviceEmulator,
      exportHandler: () => client
    };
  };

  export const restoreServiceClient = (resourceName: string) => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceName(resourceName, CONTEXT.options);
    const serviceEmulator = CONTEXT.emulators[serviceName];

    if (!serviceEmulator) {
      throw new EmulatorNotFoundError(resourceName);
    }

    CONTEXT.emulators[serviceName] = {
      ...serviceEmulator,
      exportHandler: CONTEXT.mocks[serviceName]
    };
  };
}
