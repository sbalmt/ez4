import type { ObjectSchema, ObjectSchemaProperties } from '../types/type-object';
import type { UnionSchema } from '../types/type-union';
import type { ArraySchema } from '../types/type-array';
import type { TupleSchema } from '../types/type-tuple';
import type { AnySchema } from '../types/type-any';

import { NamingStyle } from '../types/naming';
import { SchemaType } from '../types/common';

import { toCamelCase, toKebabCase, toPascalCase, toSnakeCase } from '@ez4/utils';

export const getPropertyName = (property: string, namingStyle?: NamingStyle) => {
  switch (namingStyle) {
    case NamingStyle.CamelCase:
      return toCamelCase(property);

    case NamingStyle.PascalCase:
      return toPascalCase(property);

    case NamingStyle.SnakeCase:
      return toSnakeCase(property);

    case NamingStyle.KebabCase:
      return toKebabCase(property);

    default:
      return property;
  }
};

export const getWithNamingStyle = <T extends AnySchema>(schema: T, namingStyle?: NamingStyle): T => {
  if (!namingStyle) {
    return schema;
  }

  switch (schema.type) {
    case SchemaType.Object:
      return getObjectWithNamingStyle(schema, namingStyle) as T;

    case SchemaType.Union:
      return getUnionWithNamingStyle(schema, namingStyle) as T;

    case SchemaType.Array:
      return getArrayWithNamingStyle(schema, namingStyle) as T;

    case SchemaType.Tuple:
      return getTupleWithNamingStyle(schema, namingStyle) as T;

    default:
      return schema;
  }
};

export const getObjectWithNamingStyle = (schema: ObjectSchema, namingStyle: NamingStyle): ObjectSchema => {
  const properties: ObjectSchemaProperties = {};

  for (const property in schema.properties) {
    const propertyName = getPropertyName(property, namingStyle);
    const propertySchema = schema.properties[property];

    properties[propertyName] = getWithNamingStyle(propertySchema, namingStyle);
  }

  return {
    ...schema,
    properties
  };
};

export const getUnionWithNamingStyle = (schema: UnionSchema, namingStyle: NamingStyle): UnionSchema => {
  const elements = [];

  for (const element of schema.elements) {
    elements.push(getWithNamingStyle(element, namingStyle));
  }

  return {
    ...schema,
    elements
  };
};

export const getArrayWithNamingStyle = (schema: ArraySchema, namingStyle: NamingStyle): ArraySchema => {
  return {
    ...schema,
    element: getWithNamingStyle(schema.element, namingStyle)
  };
};

export const getTupleWithNamingStyle = (schema: TupleSchema, namingStyle: NamingStyle): TupleSchema => {
  const elements = [];

  for (const element of schema.elements) {
    elements.push(getWithNamingStyle(element, namingStyle));
  }

  return {
    ...schema,
    elements
  };
};
