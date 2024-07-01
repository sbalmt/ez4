import type { SchemaTypeName } from './common.js';

export type NumberSchema = {
  type: SchemaTypeName.Number;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  minValue?: number;
  maxValue?: number;
  format?: string;
};
