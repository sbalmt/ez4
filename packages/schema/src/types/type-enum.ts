import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type EnumSchemaOption = {
  value: number | string;
  description?: string;
};

export type EnumSchemaDefinitions = SchemaDefinitions & {
  default?: number | string;
};

export type EnumSchema = {
  type: SchemaType.Enum;
  definitions?: EnumSchemaDefinitions;
  description?: string;
  options: EnumSchemaOption[];
  optional?: boolean;
  nullable?: boolean;
};

export const isEnumSchema = (schema: AnySchema): schema is EnumSchema => {
  return schema.type === SchemaType.Enum;
};

export const isEmptyEnumSchema = (schema: EnumSchema) => {
  return !schema.options.length;
};
