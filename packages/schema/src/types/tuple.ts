import type { AnySchema, SchemaTypeName } from './common.js';

export type TupleSchema = {
  type: SchemaTypeName.Tuple;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};
