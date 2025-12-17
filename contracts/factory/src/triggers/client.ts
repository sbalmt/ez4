import type { FactoryService } from '../metadata/types';

export const prepareLinkedClient = (service: FactoryService) => {
  const { handler, variables, services } = service;

  return {
    constructor: `(@{context})`,
    from: `./${handler.file}`,
    module: handler.name,
    callable: true,
    variables,
    services
  };
};
