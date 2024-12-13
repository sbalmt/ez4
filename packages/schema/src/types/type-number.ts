import type { AnyObject } from '@ez4/utils';
import type { SchemaDefinitions } from './common.js';

import { SchemaType } from './common.js';

export type NumberSchemaDefinitions = SchemaDefinitions & {
  minValue?: number;
  maxValue?: number;
  value?: number;
};

export type NumberSchema = {
  type: SchemaType.Number;
  definitions?: NumberSchemaDefinitions;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  format?: string;
};

export const isNumberSchema = (value: AnyObject): value is NumberSchema => {
  return value.type === SchemaType.Number;
};
