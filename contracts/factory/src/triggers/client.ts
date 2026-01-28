import type { DeployOptions, EventContext, LinkedServices } from '@ez4/project/library';
import type { FactoryService } from '../metadata/types';
import { isFactoryState } from './utils';

export const prepareLinkedClient = (context: EventContext, service: FactoryService, options: DeployOptions) => {
  const { handler, variables, services } = service;

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `@{EZ4_MODULE_IMPORT}(@{EZ4_MODULE_CONTEXT})`,
    connectionIds: getAllConnections(services, context, options),
    variables,
    services
  };
};

const getAllConnections = (services: LinkedServices, context: EventContext, options: DeployOptions): string[] => {
  const connectionIds = [];

  for (const serviceName in services) {
    const identity = services[serviceName];
    const serviceState = context.tryGetServiceState(identity, options);

    if (!serviceState) {
      continue;
    }

    if (isFactoryState(serviceState)) {
      connectionIds.push(...getAllConnections(serviceState.parameters.services, context, options));
    } else {
      connectionIds.push(serviceState.entryId);
    }
  }

  return connectionIds;
};
