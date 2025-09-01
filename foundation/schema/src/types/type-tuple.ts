import type { SchemaDefinitions } from './common';
import type { AnySchema } from './type-any';

import { SchemaType } from './common';

export type TupleSchemaDefinitions = SchemaDefinitions & {
  default?: unknown[];
};

export type TupleSchema = {
  type: SchemaType.Tuple;
  definitions?: TupleSchemaDefinitions;
  description?: string;
  elements: AnySchema[];
  optional?: boolean;
  nullable?: boolean;
};

export const isTupleSchema = (schema: AnySchema): schema is TupleSchema => {
  return schema.type === SchemaType.Tuple;
};
