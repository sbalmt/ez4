import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { ValidationService } from '../metadata/types';

export const prepareLinkedClient = (context: EventContext, service: ValidationService, options: DeployOptions) => {
  const { handler, schema, variables, services } = service;

  const connectionIds = [];

  for (const serviceName in services) {
    const identity = services[serviceName];
    const state = context.tryGetServiceState(identity, options);

    if (state) {
      connectionIds.push(state.entryId);
    }
  }

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

    connectionIds,
    variables,
    services
  };
};
