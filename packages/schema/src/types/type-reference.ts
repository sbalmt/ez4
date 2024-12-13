import type { AnyObject } from '@ez4/utils';

import { SchemaType } from './common.js';

export type ReferenceSchema = {
  type: SchemaType.Reference;
  identity: number;
  optional?: boolean;
  nullable?: boolean;
};

export const isReferenceSchema = (value: AnyObject): value is ReferenceSchema => {
  return value.type === SchemaType.Reference;
};
