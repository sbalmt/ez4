import type { EmulateServiceEvent, ServiceEmulator } from '@ez4/project/library';
import type { ServiceOptions } from '../worker';

import { getServiceName } from '@ez4/project/library';

import { isValidationService } from '../metadata/types';

export const getEmulatorService = (event: EmulateServiceEvent): ServiceEmulator | null => {
  const { service, options, context } = event;

  if (!isValidationService(service)) {
    return null;
  }

  const { name: resourceName, services: dependencies, schema, handler } = service;

  return {
    type: 'Validation',
    name: resourceName,
    options: service.options,
    identifier: getServiceName(resourceName, options),
    exportDescriptor: (options) => {
      const references = context.makeReferences(dependencies, handler.references, options);

      return {
        name: 'makeService',
        module: '@ez4/validation/worker',
        dependencies,
        options: {
          references,
          handler,
          schema
        } satisfies ServiceOptions
      };
    }
  };
};
