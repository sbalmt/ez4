import type { EmulateServiceEvent, EntrypointModule, ServiceEmulator } from '@ez4/project/library';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';

import { isFactoryService } from '../metadata/types';

export const getEmulatorService = (event: EmulateServiceEvent): ServiceEmulator | null => {
  const { service, options, context } = event;

  if (!isFactoryService(service)) {
    return null;
  }

  const { name: resourceName, services, handler } = service;

  let factoryModule: EntrypointModule;

  return {
    type: 'Factory',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    options: service.options,
    exportHandler: (serviceOptions) => () => {
      return factoryModule.invoke(context.makeClients(services, serviceOptions));
    },
    bootstrapHandler: async () => {
      factoryModule = await createEmulatorModule({
        version: options.version,
        entrypoint: handler,
        variables: {
          ...options.variables,
          ...service.variables
        }
      });
    }
  };
};
