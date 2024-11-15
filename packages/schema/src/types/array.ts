import type { AnyObject } from '@ez4/utils';
import type { AnySchema, ExtraSchema } from './common.js';

import { SchemaType } from './common.js';

export type ArraySchema = {
  type: SchemaType.Array;
  element: AnySchema;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};

export const isArraySchema = (value: AnyObject): value is ArraySchema => {
  return value.type === SchemaType.Array;
};
