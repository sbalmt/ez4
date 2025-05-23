import type { AnyObject } from '@ez4/utils';

import type { ScalarSchema } from './scalar.js';
import type { ObjectSchema } from './type-object.js';
import type { ReferenceSchema } from './type-reference.js';
import type { UnionSchema } from './type-union.js';
import type { ArraySchema } from './type-array.js';
import type { TupleSchema } from './type-tuple.js';
import type { EnumSchema } from './type-enum.js';

import { SchemaType } from './common.js';

export type AnySchema = ScalarSchema | ObjectSchema | ReferenceSchema | UnionSchema | ArraySchema | TupleSchema | EnumSchema;

const SchemaTypes = [
  SchemaType.Boolean,
  SchemaType.Number,
  SchemaType.String,
  SchemaType.Object,
  SchemaType.Reference,
  SchemaType.Union,
  SchemaType.Array,
  SchemaType.Tuple,
  SchemaType.Enum
];

export const isAnySchema = (schema: AnyObject): schema is AnySchema => {
  return 'type' in schema && SchemaTypes.includes(schema.type);
};

export const IsNullishSchema = (schema: AnySchema) => {
  return schema.nullable || schema.optional;
};
