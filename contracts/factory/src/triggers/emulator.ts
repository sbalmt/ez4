import type { EmulateServiceEvent, ServiceEmulator } from '@ez4/project/library';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';

import { isFactoryService } from '../metadata/types';

export const getEmulatorService = (event: EmulateServiceEvent): ServiceEmulator | null => {
  const { service, options, context } = event;

  if (!isFactoryService(service)) {
    return null;
  }

  const { name: resourceName, services, handler } = service;

  return {
    type: 'Factory',
    name: resourceName,
    identifier: getServiceName(resourceName, options),
    exportHandler: async () => {
      const clients = await context.makeClients(services);

      const factoryModule = await createEmulatorModule({
        version: options.version,
        entrypoint: handler,
        variables: {
          ...options.variables,
          ...service.variables
        }
      });

      return factoryModule.invoke(clients);
    }
  };
};
