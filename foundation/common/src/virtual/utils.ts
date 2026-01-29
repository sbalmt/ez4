import type { DeployOptions, EventContext, LinkedServices } from '@ez4/project/library';

import { isVirtualState } from './types';

export const getLinkedConnections = (services: LinkedServices, context: EventContext, options: DeployOptions): string[] => {
  const connectionIds = [];

  for (const serviceName in services) {
    const identity = services[serviceName];

    const serviceState = context.getVirtualServiceState(identity, options) ?? context.getServiceState(identity, options);

    if (serviceState) {
      if (!isVirtualState(serviceState)) {
        connectionIds.push(serviceState.entryId);
        continue;
      }

      if (serviceState.parameters.services) {
        const linkedServices = serviceState.parameters.services;
        const linkedConnections = getLinkedConnections(linkedServices, context, options);

        connectionIds.push(...linkedConnections);
      }
    }
  }

  return connectionIds;
};
