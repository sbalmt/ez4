import type { ContextSource } from '@ez4/project/library';
import type { FactoryService } from '../metadata/types';

export const prepareLinkedClient = (service: FactoryService): ContextSource => {
  const { handler } = service;

  return {
    constructor: `${handler.name}(__EZ4_CONTEXT)`,
    from: `./${handler.file}`,
    module: handler.name,
    namespace: false
  };
};
