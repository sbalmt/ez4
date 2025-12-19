import type { EmulateServiceEvent } from '@ez4/project/library';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';

import { isValidationService } from '../metadata/types';

export const getEmulatorService = (event: EmulateServiceEvent) => {
  const { service, options, context } = event;

  if (!isValidationService(service)) {
    return null;
  }

  const { name: serviceName, schema, services, handler } = service;

  return {
    type: 'Validation',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: async () => {
      const clients = await context.makeClients(services);

      const validationModule = await createEmulatorModule({
        version: options.version,
        entrypoint: handler,
        variables: {
          ...options.variables,
          ...service.variables
        }
      });

      return new (class {
        get schema() {
          return schema;
        }

        async validate(input: unknown) {
          await validationModule.invoke(input, clients);
        }

        async tryValidate(input: unknown) {
          try {
            return (await this.validate(input), true);
          } catch {
            return false;
          }
        }
      })();
    }
  };
};
