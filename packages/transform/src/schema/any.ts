import type { AnySchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';
import { transformScalar } from './scalar.js';
import { transformObject } from './object.js';
import { transformReference } from './reference.js';
import { transformUnion } from './union.js';
import { transformArray } from './array.js';
import { transformTuple } from './tuple.js';
import { transformEnum } from './enum.js';

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
      return transformEnum(value, schema);
  }
};
