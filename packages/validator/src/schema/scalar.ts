import type { ScalarSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context.js';

import { SchemaType } from '@ez4/schema';

import { validateBoolean } from './boolean.js';
import { validateNumber } from './number.js';
import { validateString } from './string.js';

export const validateScalar = (value: unknown, schema: ScalarSchema, context?: ValidationContext) => {
  switch (schema.type) {
    case SchemaType.Boolean:
      return validateBoolean(value, schema, context);

    case SchemaType.Number:
      return validateNumber(value, schema, context);

    case SchemaType.String:
      return validateString(value, schema, context);
  }
};
