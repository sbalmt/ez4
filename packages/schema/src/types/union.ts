import type { AnySchema, ExtraSchema, SchemaTypeName } from './common.js';

export type UnionSchema = {
  type: SchemaTypeName.Union;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};
