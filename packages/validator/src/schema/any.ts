import type { AnySchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { validateScalar } from './scalar.js';
import { validateObject } from './object.js';
import { validateUnion } from './union.js';
import { validateArray } from './array.js';
import { validateTuple } from './tuple.js';
import { validateEnum } from './enum.js';

export const validateAny = (value: unknown, schema: AnySchema, property?: string) => {
  switch (schema.type) {
    case SchemaType.Boolean:
    case SchemaType.Number:
    case SchemaType.String:
      return validateScalar(value, schema, property);

    case SchemaType.Object:
      return validateObject(value, schema, property);

    case SchemaType.Union:
      return validateUnion(value, schema, property);

    case SchemaType.Array:
      return validateArray(value, schema, property);

    case SchemaType.Tuple:
      return validateTuple(value, schema, property);

    case SchemaType.Enum:
      return validateEnum(value, schema, property);
  }
};
