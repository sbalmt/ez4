import type { LinkedServices } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';
import type { AuthHandler } from '../auth/types';
import type { HttpHandler } from '../http/types';
import type { WsHandler } from '../ws/types';

import { getSchemaCustomValidation } from '@ez4/schema';

import { getValidatorName } from './name';

export const attachValidatorLinkedServices = (handler: HttpHandler | AuthHandler | WsHandler, services: LinkedServices) => {
  const { request } = handler;

  if (request) {
    if ('headers' in request && request.headers) {
      attachSchemaValidatorServices(services, request.headers);
    }

    if ('query' in request && request.query) {
      attachSchemaValidatorServices(services, request.query);
    }

    if ('identity' in request && request.identity) {
      attachSchemaValidatorServices(services, request.identity);
    }

    if ('parameters' in request && request.parameters) {
      attachSchemaValidatorServices(services, request.parameters);
    }

    if ('body' in request && request.body) {
      attachSchemaValidatorServices(services, request.body);
    }
  }
};

const attachSchemaValidatorServices = (services: LinkedServices, schema: AnySchema) => {
  const validatorTypes = getSchemaCustomValidation(schema);

  for (const validatorType of validatorTypes) {
    const serviceName = getValidatorName(validatorType);

    services[serviceName] = validatorType;
  }
};
