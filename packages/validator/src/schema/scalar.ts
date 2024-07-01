import type { ScalarSchema } from '@ez4/schema';

import { SchemaTypeName } from '@ez4/schema';

import { validateBoolean } from './boolean.js';
import { validateNumber } from './number.js';
import { validateString } from './string.js';

export const validateScalar = (value: unknown, schema: ScalarSchema, property?: string) => {
  switch (schema.type) {
    case SchemaTypeName.Boolean:
      return validateBoolean(value, schema, property);

    case SchemaTypeName.Number:
      return validateNumber(value, schema, property);

    case SchemaTypeName.String:
      return validateString(value, schema, property);
  }
};
