import type { SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { getObjectSchema, isObjectSchema } from '@ez4/schema/library';

export const getSchemaFromType = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return null;
};
