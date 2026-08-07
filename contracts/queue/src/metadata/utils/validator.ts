import type { LinkedServices } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';
import type { QueueSubscription } from '../types';

import { getSchemaCustomValidation } from '@ez4/schema';

import { getValidatorName } from '../../utils/validation';

export const attachValidatorLinkedServices = (schema: AnySchema, services: LinkedServices, subscriptions: QueueSubscription[]) => {
  const validatorTypes = getSchemaCustomValidation(schema);

  for (const validatorType of validatorTypes) {
    const serviceName = getValidatorName(validatorType);

    for (const { handler } of subscriptions) {
      handler.references?.push(serviceName);
    }

    services[serviceName] = {
      reference: validatorType
    };
  }
};
