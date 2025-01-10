import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type ReferenceSchema = {
  type: SchemaType.Reference;
  identity: number;
  optional?: boolean;
  nullable?: boolean;
};

export const isReferenceSchema = (value: AnySchema): value is ReferenceSchema => {
  return value.type === SchemaType.Reference;
};
