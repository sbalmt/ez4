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
};

export type ObjectSchema = {
  type: SchemaType.Object;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  identity?: number;
  definitions?: ObjectSchemaDefinitions;
  additional?: ObjectSchemaAdditional;
  properties: ObjectSchemaProperties;
};

export const isObjectSchema = (value: AnySchema): value is ObjectSchema => {
  return value.type === SchemaType.Object;
};
