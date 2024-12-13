import type { AnyObject } from '@ez4/utils';
import type { AnySchema, SchemaDefinitions } from './common.js';

import { SchemaType } from './common.js';

export type ObjectSchemaProperties = {
  [property: string]: AnySchema;
};

export type ObjectSchemaAdditional = {
  property: AnySchema;
  value: AnySchema;
};

export type ObjectSchemaDefinitions = SchemaDefinitions & {
  extensible?: boolean;
};

export type ObjectSchema = {
  type: SchemaType.Object;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  definitions?: ObjectSchemaDefinitions;
  additional?: ObjectSchemaAdditional;
  properties: ObjectSchemaProperties;
};

export const isObjectSchema = (value: AnyObject): value is ObjectSchema => {
  return value.type === SchemaType.Object;
};
