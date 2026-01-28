import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { ValidationService } from '../metadata/types';

import { getLinkedConnections } from '@ez4/common/library';

export const prepareLinkedClient = (context: EventContext, service: ValidationService, options: DeployOptions) => {
  const { handler, schema, variables, services } = service;

  return {
    module: handler.name,
    from: `./${handler.file}`,
    constructor: `
      new (class {
        async validate(value: unknown) {
          await @{EZ4_MODULE_IMPORT}({ value, schema: this.schema }, @{EZ4_MODULE_CONTEXT});
        }
        async tryValidate(value: unknown) {
          try {
            return (await this.validate(value)), true;
          } catch {
            return false;
          }
        }
        get schema() {
          return ${JSON.stringify(schema)};
        }
      })`,
    connectionIds: getLinkedConnections(services, context, options),
    variables,
    services
  };
};
