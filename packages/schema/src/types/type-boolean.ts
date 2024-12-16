import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type BooleanSchema = {
  type: SchemaType.Boolean;
  definitions?: SchemaDefinitions;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isBooleanSchema = (value: AnySchema): value is BooleanSchema => {
  return value.type === SchemaType.Boolean;
};
