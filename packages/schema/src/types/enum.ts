import type { ExtraSchema, SchemaTypeName } from './common.js';

export type EnumSchemaOption = {
  value: string | number;
  description?: string;
};

export type EnumSchema = {
  type: SchemaTypeName.Enum;
  options: EnumSchemaOption[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};
