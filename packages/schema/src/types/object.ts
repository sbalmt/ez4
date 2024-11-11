import type { AnyObject } from '@ez4/utils';
import type { AnySchema, ExtraSchema } from './common.js';

import { SchemaTypeName } from './common.js';

export type ObjectSchemaProperties = {
  [property: string]: AnySchema;
};

export type ObjectExtraSchema = ExtraSchema & {
  extensible?: boolean;
};

export type ObjectSchema = {
  type: SchemaTypeName.Object;
  properties: ObjectSchemaProperties;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ObjectExtraSchema;
};

export const isObjectSchema = (value: AnyObject): value is ObjectSchema => {
  return value.type === SchemaTypeName.Object;
};
