import type { ObjectSchema, ObjectSchemaProperties } from '../types/type-object';
import type { UnionSchema } from '../types/type-union';
import type { ArraySchema } from '../types/type-array';
import type { TupleSchema } from '../types/type-tuple';
import type { AnySchema } from '../types/type-any';

import { SchemaType } from '../types/common';

export const getOptionalSchema = <T extends AnySchema>(schema: T): T => {
  switch (schema.type) {
    case SchemaType.Object:
      return getOptionalObjectSchema(schema) as T;

    case SchemaType.Union:
      return getOptionalUnionSchema(schema) as T;

    case SchemaType.Array:
      return getOptionalArraySchema(schema) as T;

    case SchemaType.Tuple:
      return getOptionalTupleSchema(schema) as T;

    default:
      return schema;
  }
};

export const getOptionalObjectSchema = (schema: ObjectSchema): ObjectSchema => {
  const properties: ObjectSchemaProperties = {};

  for (const propertyName in schema.properties) {
    const objectProperty = schema.properties[propertyName];

    if (objectProperty.optional) {
      properties[propertyName] = objectProperty;
      continue;
    }

    properties[propertyName] = {
      ...getOptionalSchema(objectProperty),
      optional: true
    };
  }

  return {
    ...schema,
    properties
  };
};

export const getOptionalUnionSchema = (schema: UnionSchema): UnionSchema => {
  const elements = [];

  for (const element of schema.elements) {
    elements.push(getOptionalSchema(element));
  }

  return {
    ...schema,
    elements
  };
};

export const getOptionalArraySchema = (schema: ArraySchema): ArraySchema => {
  return {
    ...schema,
    element: getOptionalSchema(schema.element)
  };
};

export const getOptionalTupleSchema = (schema: TupleSchema): TupleSchema => {
  const elements = [];

  for (const element of schema.elements) {
    elements.push(getOptionalSchema(element));
  }

  return {
    ...schema,
    elements
  };
};
