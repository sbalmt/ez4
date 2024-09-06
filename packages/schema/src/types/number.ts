import type { ExtraSchema, SchemaTypeName } from './common.js';

export type NumberExtraSchema = ExtraSchema & {
  minValue?: number;
  maxValue?: number;
};

export type NumberSchema = {
  type: SchemaTypeName.Number;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  format?: string;
  extra?: NumberExtraSchema;
};
