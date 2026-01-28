import type { EmulateServiceEvent, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { TypeClass } from '@ez4/reflection';

import { getServiceName, createEmulatorModule } from '@ez4/project/library';
import { ServiceType } from '@ez4/common/library';
import { hashData } from '@ez4/utils';

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

  if (isFactoryService(event.service)) {
    return false;
  }

  context.setServiceState(service, options, {
    entryId: hashData(ServiceType, service.name),
    type: ServiceType,
    dependencies: [],
    parameters: null
  });

  return true;
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
