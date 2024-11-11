import type { AnyObject } from '@ez4/utils';
import type { AnySchema, ExtraSchema } from './common.js';

import { SchemaTypeName } from './common.js';
export type TupleSchema = {
  type: SchemaTypeName.Tuple;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};

export const isTupleSchema = (value: AnyObject): value is TupleSchema => {
  return value.type === SchemaTypeName.Tuple;
};
