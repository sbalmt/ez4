import type { ContextSource } from '@ez4/project/library';
import type { FactoryService } from '../metadata/types';

export const prepareLinkedClient = (service: FactoryService): ContextSource => {
  const { handler, variables, services } = service;

  return {
    constructor: `${handler.name}(@{context})`,
    from: `./${handler.file}`,
    module: handler.name,
    namespace: false,
    variables,
    services
  };
};
