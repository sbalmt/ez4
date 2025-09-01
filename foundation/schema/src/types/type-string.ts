import type { SchemaDefinitions } from './common';
import type { AnySchema } from './type-any';

import { SchemaType } from './common';

export type StringSchemaDefinitions = SchemaDefinitions & {
  minLength?: number;
  maxLength?: number;
  trim?: boolean;
  pattern?: string;
  default?: string;
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

export const isStringSchema = (schema: AnySchema): schema is StringSchema => {
  return schema.type === SchemaType.String;
};
