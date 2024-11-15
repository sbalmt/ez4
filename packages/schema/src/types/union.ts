import type { AnyObject } from '@ez4/utils';
import type { AnySchema, ExtraSchema } from './common.js';

import { SchemaType } from './common.js';

export type UnionSchema = {
  type: SchemaType.Union;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};

export const isUnionSchema = (value: AnyObject): value is UnionSchema => {
  return value.type === SchemaType.Union;
};
