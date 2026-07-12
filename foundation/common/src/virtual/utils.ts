import type { DeployOptions, EventContext, LinkedServices } from '@ez4/project/library';

import { isVirtualState } from './types';

export const getVirtualConnections = (services: LinkedServices, context: EventContext, options: DeployOptions): string[] => {
  const connectionIds: string[] = [];
  const resolutionCache = new Set();

  const collectConnections = (linkedServices: LinkedServices) => {
    for (const linkedName in linkedServices) {
      const { reference: serviceName } = linkedServices[linkedName];

      if (resolutionCache.has(serviceName)) {
        continue;
      }

      resolutionCache.add(serviceName);

      const serviceState = context.getVirtualServiceState(serviceName, options) ?? context.getServiceState(serviceName, options);

      if (serviceState) {
        if (!isVirtualState(serviceState)) {
          connectionIds.push(serviceState.entryId);
          continue;
        }

        const { services: subLinkedServices } = serviceState.parameters;

        if (subLinkedServices) {
          collectConnections(subLinkedServices);
        }
      }
    }
  };

  collectConnections(services);

  return connectionIds;
};
