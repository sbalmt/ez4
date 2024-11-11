import type { AnyObject } from '@ez4/utils';
import type { ExtraSchema } from './common.js';

import { SchemaTypeName } from './common.js';

export type BooleanSchema = {
  type: SchemaTypeName.Boolean;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  extra?: ExtraSchema;
};

export const isBooleanSchema = (value: AnyObject): value is BooleanSchema => {
  return value.type === SchemaTypeName.Boolean;
};
