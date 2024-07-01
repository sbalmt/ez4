import type { SchemaTypeName } from './common.js';
import type { BooleanSchema } from './boolean.js';
import type { NumberSchema } from './number.js';
import type { StringSchema } from './string.js';

export type ScalarTypeName = SchemaTypeName.Boolean | SchemaTypeName.Number | SchemaTypeName.String;

export type ScalarSchema = BooleanSchema | NumberSchema | StringSchema;
