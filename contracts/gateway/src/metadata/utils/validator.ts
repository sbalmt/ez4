import type { LinkedServices } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';
import type { ReflectionTypes } from '@ez4/reflection';
import type { AuthHandler } from '../auth/types';
import type { HttpHandler } from '../http/types';
import type { WsHandler } from '../ws/types';

import { isExternalLinkedService } from '@ez4/common/library';
import { getSchemaCustomValidation } from '@ez4/schema';

import { getValidatorName } from '../../utils/validation';

export const attachValidatorLinkedServices = (
  handler: HttpHandler | AuthHandler | WsHandler,
  services: LinkedServices,
  reflection: ReflectionTypes
) => {
  const { request, references } = handler;

  if (request) {
    if ('headers' in request && request.headers) {
      attachSchemaValidatorServices(request.headers, services, reflection, references);
    }

    if ('query' in request && request.query) {
      attachSchemaValidatorServices(request.query, services, reflection, references);
    }

    if ('identity' in request && request.identity) {
      attachSchemaValidatorServices(request.identity, services, reflection, references);
    }

    if ('parameters' in request && request.parameters) {
      attachSchemaValidatorServices(request.parameters, services, reflection, references);
    }

    if ('body' in request && request.body) {
      attachSchemaValidatorServices(request.body, services, reflection, references);
    }
  }
};

const attachSchemaValidatorServices = (schema: AnySchema, services: LinkedServices, reflection: ReflectionTypes, references?: string[]) => {
  const validatorTypes = getSchemaCustomValidation(schema);

  for (const validatorType of validatorTypes) {
    if (isExternalLinkedService(validatorType, reflection)) {
      continue;
    }

    const serviceName = getValidatorName(validatorType);

    references?.push(serviceName);

    services[serviceName] = {
      reference: validatorType
    };
  }
};
