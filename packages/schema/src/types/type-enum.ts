import type { AnyObject } from '@ez4/utils';
import type { SchemaDefinitions } from './common.js';

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

export const isEnumSchema = (value: AnyObject): value is EnumSchema => {
  return value.type === SchemaType.Enum;
};
