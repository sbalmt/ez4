import type { AnySchema } from './type-any';

import { SchemaType } from './common';

export type ReferenceSchema = {
  type: SchemaType.Reference;
  identity: number;
  optional?: boolean;
  nullable?: boolean;
};

export const isReferenceSchema = (schema: AnySchema): schema is ReferenceSchema => {
  return schema.type === SchemaType.Reference;
};
