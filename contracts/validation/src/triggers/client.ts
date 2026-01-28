import type { DeployOptions, EventContext, LinkedServices } from '@ez4/project/library';
import type { ValidationService } from '../metadata/types';

import { isValidationState } from './utils';

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
    connectionIds: getAllConnections(services, context, options),
    variables,
    services
  };
};

const getAllConnections = (services: LinkedServices, context: EventContext, options: DeployOptions): string[] => {
  const connectionIds = [];

  for (const serviceName in services) {
    const identity = services[serviceName];
    const serviceState = context.tryGetServiceState(identity, options);

    if (!serviceState) {
      continue;
    }

    if (isValidationState(serviceState)) {
      connectionIds.push(...getAllConnections(serviceState.parameters.services, context, options));
    } else {
      connectionIds.push(serviceState.entryId);
    }
  }

  return connectionIds;
};
