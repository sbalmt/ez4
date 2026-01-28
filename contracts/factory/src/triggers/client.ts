import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { FactoryService } from '../metadata/types';

import { getLinkedConnections } from '@ez4/common/library';

export const prepareLinkedClient = (context: EventContext, service: FactoryService, options: DeployOptions) => {
  const { handler, variables, services } = service;

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `@{EZ4_MODULE_IMPORT}(@{EZ4_MODULE_CONTEXT})`,
    connectionIds: getLinkedConnections(services, context, options),
    variables,
    services
  };
};
