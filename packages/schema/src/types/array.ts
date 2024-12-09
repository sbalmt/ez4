import type { AnyObject } from '@ez4/utils';
import type { AnySchema, SchemaDefinitions } from './common.js';

import { SchemaType } from './common.js';

export type ArraySchema = {
  type: SchemaType.Array;
  definitions?: SchemaDefinitions;
  element: AnySchema;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isArraySchema = (value: AnyObject): value is ArraySchema => {
  return value.type === SchemaType.Array;
};
