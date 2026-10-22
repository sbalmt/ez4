import type { AnyObject } from '@ez4/utils';
import type { ServiceEmulators } from './service';
import type { LinkedVariables } from '../types/service';

import { getServiceName } from '../utils/service';
import { EmulatorNotFoundError } from './errors';
import { loadServiceClient } from './client';

type TesterContext = {
  mocks?: Record<string, unknown>;
  emulators?: ServiceEmulators;
  options?: TesterOptions;
};

type TesterOptions = {
  prefix: string;
  projectName: string;
  branchName: string;
  variables?: LinkedVariables;
};

export namespace Tester {
  const CONTEXT: TesterContext = {};

  const ensureContext = (context: TesterContext): context is Required<TesterContext> => {
    return !!context.options && !!context.emulators;
  };

  const getServiceEmulatorName = (context: Required<TesterContext>, resourceName: string) => {
    const serviceName = getServiceName(resourceName, context.options);

    if (!context.emulators[serviceName]) {
      throw new EmulatorNotFoundError(resourceName);
    }

    return serviceName;
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

  export const getServiceClient = async (resourceName: string, resourceOptions?: AnyObject): Promise<unknown> => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceEmulatorName(CONTEXT, resourceName);

    if (serviceName in CONTEXT.mocks) {
      return CONTEXT.mocks[serviceName];
    }

    return loadServiceClient(CONTEXT.emulators, CONTEXT.options, resourceName, resourceOptions);
  };

  export const mockServiceClient = (resourceName: string, client: unknown) => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceEmulatorName(CONTEXT, resourceName);

    CONTEXT.mocks[serviceName] = client;
  };

  export const restoreServiceClient = (resourceName: string) => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Tester is not configured yet.');
    }

    const serviceName = getServiceEmulatorName(CONTEXT, resourceName);

    delete CONTEXT.mocks[serviceName];
  };
}
