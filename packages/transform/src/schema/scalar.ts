import type { ScalarSchema } from '@ez4/schema';

import { SchemaType } from '@ez4/schema';

import { createTransformContext } from '../types/context.js';
import { transformBoolean } from './boolean.js';
import { transformNumber } from './number.js';
import { transformString } from './string.js';

export const transformScalar = (value: unknown, schema: ScalarSchema, context = createTransformContext()) => {
  switch (schema.type) {
    case SchemaType.Boolean:
      return transformBoolean(value, schema, context);

    case SchemaType.Number:
      return transformNumber(value, schema, context);

    case SchemaType.String:
      return transformString(value, schema, context);
  }
};
