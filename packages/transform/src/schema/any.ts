import type { AnySchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { transformScalar } from './scalar.js';
import { transformObject } from './object.js';
import { transformUnion } from './union.js';
import { transformArray } from './array.js';
import { transformTuple } from './tuple.js';
import { transformEnum } from './enum.js';

export const transformAny = (value: unknown, schema: AnySchema): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  switch (schema.type) {
    case SchemaType.Boolean:
    case SchemaType.Number:
    case SchemaType.String:
      return transformScalar(value, schema);

    case SchemaType.Object:
      return transformObject(value, schema);

    case SchemaType.Union:
      return transformUnion(value, schema);

    case SchemaType.Array:
      return transformArray(value, schema);

    case SchemaType.Tuple:
      return transformTuple(value, schema);

    case SchemaType.Enum:
      return transformEnum(value, schema);
  }
};
