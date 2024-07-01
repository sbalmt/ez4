import type { AnySchema } from '@ez4/schema';

import { SchemaTypeName } from '@ez4/schema';

import { validateScalar } from './scalar.js';
import { validateObject } from './object.js';
import { validateUnion } from './union.js';
import { validateArray } from './array.js';
import { validateTuple } from './tuple.js';
import { validateEnum } from './enum.js';

export const validateAny = (value: unknown, schema: AnySchema, property?: string) => {
  switch (schema.type) {
    case SchemaTypeName.Boolean:
    case SchemaTypeName.Number:
    case SchemaTypeName.String:
      return validateScalar(value, schema, property);

    case SchemaTypeName.Object:
      return validateObject(value, schema, property);

    case SchemaTypeName.Union:
      return validateUnion(value, schema, property);

    case SchemaTypeName.Array:
      return validateArray(value, schema, property);

    case SchemaTypeName.Tuple:
      return validateTuple(value, schema, property);

    case SchemaTypeName.Enum:
      return validateEnum(value, schema, property);
  }
};
