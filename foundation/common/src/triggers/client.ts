import type { ContextSource, ServiceMetadata } from '@ez4/project/library';

import { ServiceName } from '../metadata/types';

export const prepareLinkedClient = (target: ServiceMetadata, service: ServiceMetadata): ContextSource => {
  const isVariables = service.name === ServiceName.Variables;

  return {
    module: 'Client',
    from: '@ez4/common/client',
    ...(isVariables
      ? {
          constructor: `@{EZ4_MODULE_IMPORT}.make(process.env, "Environment variable")`
        }
      : {
          constructor: `@{EZ4_MODULE_IMPORT}.make(@{EZ4_MODULE_OPTIONS}, "Service option")`,
          options: target.options
        })
  };
};
