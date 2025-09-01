import type { SchemaDefinitions } from './common';
import type { AnySchema } from './type-any';

import { SchemaType } from './common';

export type ArraySchemaDefinitions = SchemaDefinitions & {
  minLength?: number;
  maxLength?: number;
  default?: unknown[];
  encoded?: boolean;
};

export type ArraySchema = {
  type: SchemaType.Array;
  definitions?: ArraySchemaDefinitions;
  description?: string;
  element: AnySchema;
  optional?: boolean;
  nullable?: boolean;
};

export const isArraySchema = (schema: AnySchema): schema is ArraySchema => {
  return schema.type === SchemaType.Array;
};
