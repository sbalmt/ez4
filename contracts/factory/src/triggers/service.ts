import type { EmulateServiceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { TypeClass } from '@ez4/reflection';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';
import { createVirtualState } from '@ez4/common/library';

import { isFactoryServiceDeclaration } from '../metadata/service';
import { isFactoryService } from '../metadata/types';
import { prepareLinkedClient } from './client';

export const getLinkedService = (declaration: TypeClass): string | null => {
  return isFactoryServiceDeclaration(declaration) ? declaration.name : null;
};

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isFactoryService(service)) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareResources = (event: PrepareResourceEvent) => {
  const { service, options, context } = event;

  if (isFactoryService(service)) {
    context.setVirtualServiceState(service, options, createVirtualState(service));
    return true;
  }

  return false;
};

export const getEmulatorService = (event: EmulateServiceEvent) => {
  const { service, options, context } = event;

  if (!isFactoryService(service)) {
    return null;
  }

  const { name: serviceName, services, handler } = service;

  return {
    type: 'Factory',
    name: serviceName,
    identifier: getServiceName(serviceName, options),
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
