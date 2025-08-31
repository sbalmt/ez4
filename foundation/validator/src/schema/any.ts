import type { AnySchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { createValidatorContext } from '../types/context.js';
import { validateScalar } from './scalar.js';
import { validateObject } from './object.js';
import { validateReference } from './reference.js';
import { validateUnion } from './union.js';
import { validateArray } from './array.js';
import { validateTuple } from './tuple.js';
import { validateEnum } from './enum.js';

export const validateAny = (value: unknown, schema: AnySchema, context = createValidatorContext()) => {
  switch (schema.type) {
    case SchemaType.Boolean:
    case SchemaType.Number:
    case SchemaType.String:
      return validateScalar(value, schema, context);

    case SchemaType.Object:
      return validateObject(value, schema, context);

    case SchemaType.Reference:
      return validateReference(value, schema, context);

    case SchemaType.Union:
      return validateUnion(value, schema, context);

    case SchemaType.Array:
      return validateArray(value, schema, context);

    case SchemaType.Tuple:
      return validateTuple(value, schema, context);

    case SchemaType.Enum:
      return validateEnum(value, schema, context);
  }
};
