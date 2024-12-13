import type { AnyObject } from '@ez4/utils';
import type { SchemaDefinitions } from './common.js';

import { SchemaType } from './common.js';

export type BooleanSchema = {
  type: SchemaType.Boolean;
  definitions?: SchemaDefinitions;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
};

export const isBooleanSchema = (value: AnyObject): value is BooleanSchema => {
  return value.type === SchemaType.Boolean;
};
