import type { ScalarSchema } from '@ez4/schema';
import type { ValidationContext } from '../types/context';

import { SchemaType } from '@ez4/schema';

import { validateBoolean } from './boolean';
import { validateNumber } from './number';
import { validateString } from './string';

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
