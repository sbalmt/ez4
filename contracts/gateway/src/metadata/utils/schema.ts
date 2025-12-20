import type { SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { LinkedServices } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';

import { getIntersectionSchema, getObjectSchema } from '@ez4/schema/library';
import { getSchemaCustomValidation, isObjectSchema } from '@ez4/schema';
import { getValidatorName } from './type';

export const getSchemaFromIntersection = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getIntersectionSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};

export const getSchemaFromObject = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};

export const attachSchemaValidationServices = (services: LinkedServices, schema: AnySchema) => {
  const validatorTypes = getSchemaCustomValidation(schema);

  for (const validatorType of validatorTypes) {
    const serviceName = getValidatorName(validatorType);

    services[serviceName] = validatorType;
  }
};
