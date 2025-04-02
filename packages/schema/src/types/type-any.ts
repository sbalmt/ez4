import type { ScalarSchema } from './scalar.js';
import type { ObjectSchema } from './type-object.js';
import type { ReferenceSchema } from './type-reference.js';
import type { UnionSchema } from './type-union.js';
import type { ArraySchema } from './type-array.js';
import type { TupleSchema } from './type-tuple.js';
import type { EnumSchema } from './type-enum.js';

export type AnySchema = ScalarSchema | ObjectSchema | ReferenceSchema | UnionSchema | ArraySchema | TupleSchema | EnumSchema;

export const IsNullishSchema = (schema: AnySchema) => {
  return schema.nullable || schema.optional
};
