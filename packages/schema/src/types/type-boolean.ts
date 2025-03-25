import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type BooleanSchemaDefinitions = SchemaDefinitions & {
  default?: boolean;
  value?: boolean;
};

export type BooleanSchema = {
  type: SchemaType.Boolean;
  definitions?: BooleanSchemaDefinitions;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isBooleanSchema = (schema: AnySchema): schema is BooleanSchema => {
  return schema.type === SchemaType.Boolean;
};
