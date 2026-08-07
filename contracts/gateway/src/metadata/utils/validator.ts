import type { LinkedServices } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';
import type { AuthHandler } from '../auth/types';
import type { HttpHandler } from '../http/types';
import type { WsHandler } from '../ws/types';

import { getSchemaCustomValidation } from '@ez4/schema';

import { getValidatorName } from '../../utils/validation';

export const attachValidatorLinkedServices = (handler: HttpHandler | AuthHandler | WsHandler, services: LinkedServices) => {
  const { request, references } = handler;

  if (request) {
    if ('headers' in request && request.headers) {
      attachSchemaValidatorServices(request.headers, services, references);
    }

    if ('query' in request && request.query) {
      attachSchemaValidatorServices(request.query, services, references);
    }

    if ('identity' in request && request.identity) {
      attachSchemaValidatorServices(request.identity, services, references);
    }

    if ('parameters' in request && request.parameters) {
      attachSchemaValidatorServices(request.parameters, services, references);
    }

    if ('body' in request && request.body) {
      attachSchemaValidatorServices(request.body, services, references);
    }
  }
};

const attachSchemaValidatorServices = (schema: AnySchema, services: LinkedServices, references?: string[]) => {
  const validatorTypes = getSchemaCustomValidation(schema);

  for (const validatorType of validatorTypes) {
    const serviceName = getValidatorName(validatorType);

    references?.push(serviceName);

    services[serviceName] = {
      reference: validatorType
    };
  }
};
