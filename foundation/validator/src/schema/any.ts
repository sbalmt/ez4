import type { AnySchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { createValidatorContext } from '../types/context';
import { validateScalar } from './scalar';
import { validateObject } from './object';
import { validateReference } from './reference';
import { validateUnion } from './union';
import { validateArray } from './array';
import { validateTuple } from './tuple';
import { validateEnum } from './enum';

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
