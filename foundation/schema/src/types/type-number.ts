import type { SchemaDefinitions } from './common';
import type { AnySchema } from './type-any';

import { SchemaType } from './common';

export type NumberSchemaDefinitions = SchemaDefinitions & {
  minValue?: number;
  maxValue?: number;
  default?: number;
  value?: number;
};

export type NumberSchema = {
  type: SchemaType.Number;
  definitions?: NumberSchemaDefinitions;
  description?: string;
  optional?: boolean;
  nullable?: boolean;
  format?: string;
};

export const isNumberSchema = (schema: AnySchema): schema is NumberSchema => {
  return schema.type === SchemaType.Number;
};
