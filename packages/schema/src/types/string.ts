import type { AnyObject } from '@ez4/utils';
import type { ExtraSchema } from './common.js';

import { SchemaType } from './common.js';

export type StringExtraSchema = ExtraSchema & {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  value?: string;
  name?: string;
};

export type StringSchema = {
  type: SchemaType.String;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  format?: string;
  extra?: StringExtraSchema;
};

export const isStringSchema = (value: AnyObject): value is StringSchema => {
  return value.type === SchemaType.String;
};
