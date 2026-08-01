import type { EmulateServiceEvent, EntrypointModule, ServiceEmulator } from '@ez4/project/library';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';
import { pickObject } from '@ez4/utils';

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
      const servicesInUse = handler.references ? pickObject(services, handler.references) : services;
      const serviceClients = context.makeClients(servicesInUse, serviceOptions);

      return factoryModule.invoke(serviceClients);
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
