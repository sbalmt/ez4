import type { ReflectionTypes, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { getIntersectionSchema, getObjectSchema } from '@ez4/schema/library';
import { isObjectSchema } from '@ez4/schema';

export const getSchemaFromIntersection = (type: TypeObject | TypeModel | TypeIntersection, reflection: ReflectionTypes) => {
  const schema = getIntersectionSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};

export const getSchemaFromObject = (type: TypeObject | TypeModel | TypeIntersection, reflection: ReflectionTypes) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};
