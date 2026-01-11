import type { LinkedServices } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';

import { getSchemaCustomValidation } from '@ez4/schema';

import { getValidatorName } from '../../utils/validation';

export const attachValidatorLinkedServices = (schema: AnySchema, services: LinkedServices) => {
  const validatorTypes = getSchemaCustomValidation(schema);

  for (const validatorType of validatorTypes) {
    const serviceName = getValidatorName(validatorType);

    services[serviceName] = validatorType;
  }
};
