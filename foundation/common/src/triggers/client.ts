import type { ExtraSource } from '@ez4/project/library';

export const prepareLinkedClient = (): ExtraSource => {
  return {
    entryIds: [],
    constructor: `make()`,
    from: '@ez4/common/client',
    module: 'Client'
  };
};
