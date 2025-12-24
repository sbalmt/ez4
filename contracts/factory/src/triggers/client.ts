import type { FactoryService } from '../metadata/types';

export const prepareLinkedClient = (service: FactoryService) => {
  const { handler, variables, services } = service;

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `@{EZ4_MODULE_IMPORT}(@{EZ4_MODULE_CONTEXT})`,
    variables,
    services
  };
};
