import type { AnySchema, SchemaTypeName } from './common.js';

export type UnionSchema = {
  type: SchemaTypeName.Union;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};
