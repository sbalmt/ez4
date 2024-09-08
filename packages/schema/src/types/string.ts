import type { ExtraSchema, SchemaTypeName } from './common.js';

export type StringExtraSchema = ExtraSchema & {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  name?: string;
};

export type StringSchema = {
  type: SchemaTypeName.String;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  format?: string;
  extra?: StringExtraSchema;
};
