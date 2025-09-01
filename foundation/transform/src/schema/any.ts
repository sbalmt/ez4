import type { AnySchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { createTransformContext } from '../types/context';
import { transformScalar } from './scalar';
import { transformObject } from './object';
import { transformReference } from './reference';
import { transformUnion } from './union';
import { transformArray } from './array';
import { transformTuple } from './tuple';
import { transformEnum } from './enum';

export const transformAny = (value: unknown, schema: AnySchema, context = createTransformContext()): unknown => {
  if (value === null && schema.nullable) {
    return null;
  }

  switch (schema.type) {
    case SchemaType.Boolean:
    case SchemaType.Number:
    case SchemaType.String:
      return transformScalar(value, schema, context);

    case SchemaType.Object:
      return transformObject(value, schema, context);

    case SchemaType.Reference:
      return transformReference(value, schema, context);

    case SchemaType.Union:
      return transformUnion(value, schema, context);

    case SchemaType.Array:
      return transformArray(value, schema, context);

    case SchemaType.Tuple:
      return transformTuple(value, schema, context);

    case SchemaType.Enum:
      return transformEnum(value, schema, context);
  }
};
