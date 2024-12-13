import type { SchemaType } from './common.js';
import type { BooleanSchema } from './type-boolean.js';
import type { NumberSchema } from './type-number.js';
import type { StringSchema } from './type-string.js';

export type ScalarTypeName = SchemaType.Boolean | SchemaType.Number | SchemaType.String;

export type ScalarSchema = BooleanSchema | NumberSchema | StringSchema;
