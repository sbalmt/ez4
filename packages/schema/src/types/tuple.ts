import type { AnyObject } from '@ez4/utils';
import type { AnySchema, SchemaDefinitions } from './common.js';

import { SchemaType } from './common.js';
export type TupleSchema = {
  type: SchemaType.Tuple;
  definitions?: SchemaDefinitions;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isTupleSchema = (value: AnyObject): value is TupleSchema => {
  return value.type === SchemaType.Tuple;
};
