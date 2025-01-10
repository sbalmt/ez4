import type { BooleanSchema } from './type-boolean.js';
import type { NumberSchema } from './type-number.js';
import type { StringSchema } from './type-string.js';
import type { AnySchema } from './type-any.js';

import { SchemaType } from './common.js';

export type ScalarTypeName = SchemaType.Boolean | SchemaType.Number | SchemaType.String;

export type ScalarSchema = BooleanSchema | NumberSchema | StringSchema;

export const isScalarSchema = (value: AnySchema): value is ScalarSchema => {
  return [SchemaType.Boolean, SchemaType.Number, SchemaType.String].includes(value.type);
};
