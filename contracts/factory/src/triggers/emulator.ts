import type { EmulateServiceEvent, ServiceEmulator } from '@ez4/project/library';
import type { ServiceOptions } from '../worker';

import { getServiceName } from '@ez4/project/library';

import { isFactoryService } from '../metadata/types';

export const getEmulatorService = (event: EmulateServiceEvent): ServiceEmulator | null => {
  const { service, options, context } = event;

  if (!isFactoryService(service)) {
    return null;
  }

  const { name: resourceName, services: dependencies, handler } = service;

  return {
    type: 'Factory',
    name: resourceName,
    options: service.options,
    identifier: getServiceName(resourceName, options),
    exportDescriptor: (options) => {
      const references = context.makeReferences(dependencies, handler.references, options);

      return {
        name: 'makeService',
        module: '@ez4/factory/worker',
        variables: service.variables,
        dependencies,
        options: {
          references,
          handler
        } satisfies ServiceOptions
      };
    }
  };
};
