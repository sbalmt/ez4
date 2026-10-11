import type { AnyObject } from '@ez4/utils';
import type { ServiceEmulators } from './service';

import { getServiceName } from '../utils/service';
import { EmulatorNotFoundError } from './errors';
import { loadServiceClient } from './client';

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
      throw new Error('Runner is already configured.');
    }

    Object.assign(CONTEXT, {
      emulators,
      options
    });
  };

  export const getServiceClient = async (resourceName: string, resourceOptions?: AnyObject): Promise<unknown> => {
    if (!ensureContext(CONTEXT)) {
      throw new Error('Runner is not configured yet.');
    }

    const serviceName = getServiceName(resourceName, CONTEXT.options);

    if (!CONTEXT.emulators[serviceName]) {
      throw new EmulatorNotFoundError(resourceName);
    }

    return loadServiceClient(CONTEXT.emulators, CONTEXT.options, resourceName, resourceOptions);
  };
}
