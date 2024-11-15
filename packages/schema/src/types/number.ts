import type { AnyObject } from '@ez4/utils';
import type { ExtraSchema } from './common.js';

import { SchemaType } from './common.js';

export type NumberExtraSchema = ExtraSchema & {
  minValue?: number;
  maxValue?: number;
  value?: number;
};

export type NumberSchema = {
  type: SchemaType.Number;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  format?: string;
  extra?: NumberExtraSchema;
};

export const isNumberSchema = (value: AnyObject): value is NumberSchema => {
  return value.type === SchemaType.Number;
};
