import type { SchemaType } from './common.js';
import type { BooleanSchema } from './boolean.js';
import type { NumberSchema } from './number.js';
import type { StringSchema } from './string.js';

export type ScalarTypeName = SchemaType.Boolean | SchemaType.Number | SchemaType.String;

export type ScalarSchema = BooleanSchema | NumberSchema | StringSchema;
