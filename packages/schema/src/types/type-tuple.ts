import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type TupleSchemaDefinitions = SchemaDefinitions & {
  default?: unknown[];
};

export type TupleSchema = {
  type: SchemaType.Tuple;
  definitions?: TupleSchemaDefinitions;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isTupleSchema = (schema: AnySchema): schema is TupleSchema => {
  return schema.type === SchemaType.Tuple;
};
