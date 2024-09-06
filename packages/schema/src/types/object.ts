import type { AnySchema, ExtraSchema, SchemaTypeName } from './common.js';

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
