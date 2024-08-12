import type { ExtraSchema, SchemaTypeName } from './common.js';

export type StringSchema = {
  type: SchemaTypeName.String;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  format?: string;
  extra?: ExtraSchema;
};
