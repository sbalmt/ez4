import type { ContextSource, ServiceMetadata } from '@ez4/project/library';

import { ServiceName } from '../metadata/types';

export const prepareLinkedClient = (target: ServiceMetadata, service: ServiceMetadata): ContextSource => {
  const isVariables = service.name === ServiceName.Variables;

  return {
    from: '@ez4/common/client',
    ...(isVariables
      ? {
          module: 'VariablesClient',
          constructor: `@{EZ4_MODULE_IMPORT}.make()`
        }
      : {
          module: 'OptionsClient',
          constructor: `@{EZ4_MODULE_IMPORT}.make(@{EZ4_MODULE_OPTIONS})`,
          options: target.options
        })
  };
};
