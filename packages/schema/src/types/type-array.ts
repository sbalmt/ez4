import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type ArraySchemaDefinitions = SchemaDefinitions & {
  minLength?: number;
  maxLength?: number;
  default?: unknown[];
};

export type ArraySchema = {
  type: SchemaType.Array;
  definitions?: ArraySchemaDefinitions;
  element: AnySchema;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isArraySchema = (value: AnySchema): value is ArraySchema => {
  return value.type === SchemaType.Array;
};
