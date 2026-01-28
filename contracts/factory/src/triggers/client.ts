import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { FactoryService } from '../metadata/types';

export const prepareLinkedClient = (context: EventContext, service: FactoryService, options: DeployOptions) => {
  const { handler, variables, services } = service;

  const connectionIds = [];

  for (const serviceName in services) {
    const identity = services[serviceName];
    const state = context.tryGetServiceState(identity, options);

    if (state) {
      connectionIds.push(state.entryId);
    }
  }

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `@{EZ4_MODULE_IMPORT}(@{EZ4_MODULE_CONTEXT})`,
    connectionIds,
    variables,
    services
  };
};
