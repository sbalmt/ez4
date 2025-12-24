import type { SchemaDefinitions } from './common';
import type { AnySchema } from './type-any';

import { SchemaType } from './common';

export type ReferenceSchema = {
  type: SchemaType.Reference;
  identity: number;
  definitions?: SchemaDefinitions;
  optional?: boolean;
  nullable?: boolean;
};

export const isReferenceSchema = (schema: AnySchema): schema is ReferenceSchema => {
  return schema.type === SchemaType.Reference;
};
