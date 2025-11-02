import type { ContextSource } from '@ez4/project/library';

export const prepareLinkedClient = (): ContextSource => {
  return {
    constructor: `make()`,
    from: '@ez4/common/client',
    module: 'Client'
  };
};
