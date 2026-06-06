import type { AnyObject } from '@ez4/utils';
import type { ServiceEmulators } from './service';

import { getServiceName } from '../utils/service';
import { EmulatorClientNotFoundError, EmulatorNotFoundError } from './errors';

type RunnerContext = {
  emulators?: ServiceEmulators;
  options?: RunnerOptions;
};

type RunnerOptions = {
  prefix: string;
  projectName: string;
  branchName: string;
};

export namespace Runner {
  const CONTEXT: RunnerContext = {};

  const ensureContext = (context: RunnerContext): context is Required<RunnerContext> => {
    return !!context.options && !!context.emulators;
  };

  export type Options = RunnerOptions;

  export const configure = (emulators: ServiceEmulators, options: Options) => {
    if (CONTEXT.emulators) {
      throw new Error('Tester is already configured.');
    }

    Object.assign(CONTEXT, {
      emulators,
      options
    });
  };

  export const getServiceClient = (resourceName: string, resourceOptions?: AnyObject): unknown => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Runner is not configured yet.');
    }

    const serviceName = getServiceName(resourceName, CONTEXT.options);
    const serviceEmulator = CONTEXT.emulators[serviceName];

    if (!serviceEmulator) {
      throw new EmulatorNotFoundError(resourceName);
    }

    if (!serviceEmulator.exportHandler) {
      throw new EmulatorClientNotFoundError(resourceName);
    }

    const serviceClient = serviceEmulator.exportHandler(resourceOptions ?? {});

    if (serviceClient instanceof Function) {
      return serviceClient();
    }

    return serviceClient;
  };
}
