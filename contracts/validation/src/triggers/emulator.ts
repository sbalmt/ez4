import type { EmulateServiceEvent, EmulatorServiceClients, EntrypointModule, ServiceEmulator } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';

import { isValidationService } from '../metadata/types';

export const getEmulatorService = (event: EmulateServiceEvent): ServiceEmulator | null => {
  const { service, options, context } = event;

  if (!isValidationService(service)) {
    return null;
  }

  const { name: resourceName, schema, services, handler } = service;

  return {
    type: 'Validation',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
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

      return createClient(schema, validationModule, clients);
    }
  };
};

const createClient = (schema: AnySchema, module: EntrypointModule, clients: EmulatorServiceClients) => {
  return new (class {
    get schema() {
      return schema;
    }

    async validate(value: unknown) {
      await module.invoke({ value, schema }, clients);
    }

    async tryValidate(value: unknown) {
      try {
        return (await this.validate(value), true);
      } catch {
        return false;
      }
    }
  })();
};
