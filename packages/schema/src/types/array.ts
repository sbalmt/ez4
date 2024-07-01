import type { AnySchema, SchemaTypeName } from './common.js';

export type ArraySchema = {
  type: SchemaTypeName.Array;
  element: AnySchema;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};
