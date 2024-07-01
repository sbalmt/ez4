import type { ScalarSchema } from '@ez4/schema';

import { SchemaTypeName } from '@ez4/schema';
import { transformBoolean } from './boolean.js';
import { transformNumber } from './number.js';
import { transformString } from './string.js';

export const transformScalar = (value: unknown, schema: ScalarSchema) => {
  switch (schema.type) {
    case SchemaTypeName.Boolean:
      return transformBoolean(value);

    case SchemaTypeName.Number:
      return transformNumber(value);

    case SchemaTypeName.String:
      return transformString(value);
  }
};
