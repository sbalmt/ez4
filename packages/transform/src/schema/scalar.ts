import type { ScalarSchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';
import { transformBoolean } from './boolean.js';
import { transformNumber } from './number.js';
import { transformString } from './string.js';

export const transformScalar = (value: unknown, schema: ScalarSchema) => {
  switch (schema.type) {
    case SchemaType.Boolean:
      return transformBoolean(value);

    case SchemaType.Number:
      return transformNumber(value, schema);

    case SchemaType.String:
      return transformString(value, schema);
  }
};
