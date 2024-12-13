import type { AnyObject } from '@ez4/utils';
import type { SchemaDefinitions } from './common.js';

import { SchemaType } from './common.js';

export type StringSchemaDefinitions = SchemaDefinitions & {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  value?: string;
  name?: string;
};

export type StringSchema = {
  type: SchemaType.String;
  definitions?: StringSchemaDefinitions;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  format?: string;
};

export const isStringSchema = (value: AnyObject): value is StringSchema => {
  return value.type === SchemaType.String;
};
