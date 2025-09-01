import type { AnyObject } from '@ez4/utils';

import type { ScalarSchema } from './type-scalar';
import type { ObjectSchema } from './type-object';
import type { ReferenceSchema } from './type-reference';
import type { UnionSchema } from './type-union';
import type { ArraySchema } from './type-array';
import type { TupleSchema } from './type-tuple';
import type { EnumSchema } from './type-enum';

import { SchemaType } from './common';

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
