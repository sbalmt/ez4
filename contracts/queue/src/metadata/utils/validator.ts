import type { LinkedServices } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';
import type { ReflectionTypes } from '@ez4/reflection';
import type { QueueSubscription } from '../types';

import { isExternalLinkedService } from '@ez4/common/library';
import { getSchemaCustomValidation } from '@ez4/schema';

import { getValidatorName } from '../../utils/validation';

export const attachValidatorLinkedServices = (
  schema: AnySchema,
  services: LinkedServices,
  subscriptions: QueueSubscription[],
  reflection: ReflectionTypes,
  workspacePath?: string
) => {
  const validatorTypes = getSchemaCustomValidation(schema);

  for (const validatorType of validatorTypes) {
    if (isExternalLinkedService(validatorType, reflection, workspacePath)) {
      continue;
    }

    const serviceName = getValidatorName(validatorType);

    for (const { handler } of subscriptions) {
      handler.references?.push(serviceName);
    }

    services[serviceName] = {
      reference: validatorType
    };
  }
};
