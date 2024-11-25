import type { ScalarSchema } from './scalar.js';
import type { ObjectSchema } from './object.js';
import type { UnionSchema } from './union.js';
import type { ArraySchema } from './array.js';
import type { TupleSchema } from './tuple.js';
import type { EnumSchema } from './enum.js';

export type ExtraSchema = {};

export const enum SchemaType {
  Boolean = 'boolean',
  Number = 'number',
  String = 'string',
  Object = 'object',
  Union = 'union',
  Array = 'array',
  Tuple = 'tuple',
  Enum = 'enum'
}

export type AnySchema =
  | ScalarSchema
  | ObjectSchema
  | UnionSchema
  | ArraySchema
  | TupleSchema
  | EnumSchema;
