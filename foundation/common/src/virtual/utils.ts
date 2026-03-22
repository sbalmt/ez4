import type { DeployOptions, EventContext, LinkedServices } from '@ez4/project/library';

import { isVirtualState } from './types';

export const getVirtualConnections = (services: LinkedServices, context: EventContext, options: DeployOptions): string[] => {
  const connectionIds: string[] = [];
  const resolutionCache = new Set();

  const collectConnections = (services: LinkedServices) => {
    for (const serviceName in services) {
      const identity = services[serviceName];

      if (resolutionCache.has(identity)) {
        continue;
      }

      resolutionCache.add(identity);

      const serviceState = context.getVirtualServiceState(identity, options) ?? context.getServiceState(identity, options);

      if (serviceState) {
        if (!isVirtualState(serviceState)) {
          connectionIds.push(serviceState.entryId);
          continue;
        }

        const { services: linkedServices } = serviceState.parameters;

        if (linkedServices) {
          collectConnections(linkedServices);
        }
      }
    }
  };

  collectConnections(services);

  return connectionIds;
};
