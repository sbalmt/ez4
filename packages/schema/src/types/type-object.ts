import type { AnyObject } from '@ez4/utils';
import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

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
  default?: AnyObject;
  value?: AnyObject;
};

export type ObjectSchema = {
  type: SchemaType.Object;
  identity?: number;
  description?: string;
  definitions?: ObjectSchemaDefinitions;
  additional?: ObjectSchemaAdditional;
  properties: ObjectSchemaProperties;
  optional?: boolean;
  nullable?: boolean;
};

export const isObjectSchema = (schema: AnySchema): schema is ObjectSchema => {
  return schema.type === SchemaType.Object;
};

export const isDynamicObjectSchema = (schema: ObjectSchema) => {
  return schema.definitions?.extensible || !!schema.additional;
};

export const getObjectSchemaProperty = (schema: ObjectSchema, propertyName: string) => {
  return schema.properties[propertyName] ?? schema.additional?.value;
};
