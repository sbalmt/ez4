import type { ContextSource } from '@ez4/project/library';

export const prepareLinkedClient = (): ContextSource => {
  return {
    module: 'Client',
    from: '@ez4/aws-email/client',
    constructor: `@{EZ4_MODULE_IMPORT}.make()`
  };
};
