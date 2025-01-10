import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type EnumSchemaOption = {
  value: string | number;
  description?: string;
};

export type EnumSchema = {
  type: SchemaType.Enum;
  definitions?: SchemaDefinitions;
  options: EnumSchemaOption[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isEnumSchema = (value: AnySchema): value is EnumSchema => {
  return value.type === SchemaType.Enum;
};
