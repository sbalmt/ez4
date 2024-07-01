import type { AnySchema } from '@ez4/schema';

import { SchemaTypeName } from '@ez4/schema';

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
    case SchemaTypeName.Boolean:
    case SchemaTypeName.Number:
    case SchemaTypeName.String:
      return transformScalar(value, schema);

    case SchemaTypeName.Object:
      return transformObject(value, schema);

    case SchemaTypeName.Union:
      return transformUnion(value, schema);

    case SchemaTypeName.Array:
      return transformArray(value, schema);

    case SchemaTypeName.Tuple:
      return transformTuple(value, schema);

    case SchemaTypeName.Enum:
      return transformEnum(value, schema);
  }
};
