import type { SchemaDefinitions } from './common';
import type { AnySchema } from './type-any';

import { SchemaType } from './common';

export type UnionSchema = {
  type: SchemaType.Union;
  definitions?: SchemaDefinitions;
  description?: string;
  elements: AnySchema[];
  optional?: boolean;
  nullable?: boolean;
};

export const isUnionSchema = (schema: AnySchema): schema is UnionSchema => {
  return schema.type === SchemaType.Union;
};
