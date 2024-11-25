import type { AnyObject } from '@ez4/utils';
import type { ExtraSchema } from './common.js';

import { SchemaType } from './common.js';

export type BooleanSchema = {
  type: SchemaType.Boolean;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};

export const isBooleanSchema = (value: AnyObject): value is BooleanSchema => {
  return value.type === SchemaType.Boolean;
};
