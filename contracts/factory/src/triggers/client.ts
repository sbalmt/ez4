import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { FactoryService } from '../metadata/types';

import { getVirtualConnections } from '@ez4/common/library';
import { pickObject } from '@ez4/utils';

export const prepareLinkedClient = (context: EventContext, service: FactoryService, options: DeployOptions) => {
  const { handler, variables, services } = service;

  const servicesInUse = handler.references ? pickObject(services, handler.references) : services;

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `@{EZ4_MODULE_IMPORT}(@{EZ4_MODULE_CONTEXT})`,
    connectionIds: getVirtualConnections(servicesInUse, context, options),
    options: service.options,
    services: servicesInUse,
    variables
  };
};
