import type { ScalarSchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { validateBoolean } from './boolean.js';
import { validateNumber } from './number.js';
import { validateString } from './string.js';

export const validateScalar = (value: unknown, schema: ScalarSchema, property?: string) => {
  switch (schema.type) {
    case SchemaType.Boolean:
      return validateBoolean(value, schema, property);

    case SchemaType.Number:
      return validateNumber(value, schema, property);

    case SchemaType.String:
      return validateString(value, schema, property);
  }
};
