import type { EmulateServiceEvent, ServiceEmulator } from '@ez4/project/library';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';

import { isFactoryService } from '../metadata/types';

export const getEmulatorService = (event: EmulateServiceEvent): ServiceEmulator | null => {
  const { service, options, context } = event;

  if (!isFactoryService(service)) {
    return null;
  }

  const { name: serviceName, services, handler } = service;

  return {
    type: 'Factory',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
    exportHandler: async (cacheToken) => {
      const clients = await context.makeClients(services, cacheToken);

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
