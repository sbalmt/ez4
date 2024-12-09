import type { AnyObject } from '@ez4/utils';
import type { AnySchema, SchemaDefinitions } from './common.js';

import { SchemaType } from './common.js';

export type ObjectSchemaProperties = {
  [property: string]: AnySchema;
};

export type ObjectSchemaDefinitions = SchemaDefinitions & {
  extensible?: boolean;
};

export type ObjectSchema = {
  type: SchemaType.Object;
  definitions?: ObjectSchemaDefinitions;
  properties: ObjectSchemaProperties;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isObjectSchema = (value: AnyObject): value is ObjectSchema => {
  return value.type === SchemaType.Object;
};
