import type { AnyObject } from '@ez4/utils';
import type { ExtraSchema } from './common.js';

import { SchemaTypeName } from './common.js';

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

export const isEnumSchema = (value: AnyObject): value is EnumSchema => {
  return value.type === SchemaTypeName.Enum;
};
