import type { AnyObject } from '@ez4/utils';
import type { AnySchema, ExtraSchema } from './common.js';

import { SchemaTypeName } from './common.js';

export type UnionSchema = {
  type: SchemaTypeName.Union;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};

export const isUnionSchema = (value: AnyObject): value is UnionSchema => {
  return value.type === SchemaTypeName.Union;
};
