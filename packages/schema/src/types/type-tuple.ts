import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';
export type TupleSchema = {
  type: SchemaType.Tuple;
  definitions?: SchemaDefinitions;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isTupleSchema = (value: AnySchema): value is TupleSchema => {
  return value.type === SchemaType.Tuple;
};
