import type { SchemaDefinitions } from './common.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type UnionSchema = {
  type: SchemaType.Union;
  definitions?: SchemaDefinitions;
  elements: AnySchema[];
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isUnionSchema = (schema: AnySchema): schema is UnionSchema => {
  return schema.type === SchemaType.Union;
};
