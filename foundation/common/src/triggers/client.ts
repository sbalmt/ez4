import type { ContextSource } from '@ez4/project/library';

export const prepareLinkedClient = (): ContextSource => {
  return {
    module: 'Client',
    from: '@ez4/common/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make()`
  };
};
