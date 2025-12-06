import type { SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { getIntersectionSchema, getObjectSchema, isObjectSchema } from '@ez4/schema/library';

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
