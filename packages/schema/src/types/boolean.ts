import type { ExtraSchema, SchemaTypeName } from './common.js';

export type BooleanSchema = {
  type: SchemaTypeName.Boolean;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};
