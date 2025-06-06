import type { ObjectSchema } from '../types/type-object.js';
import type { UnionSchema } from '../types/type-union.js';
import type { ArraySchema } from '../types/type-array.js';
import type { TupleSchema } from '../types/type-tuple.js';
import type { AnySchema } from '../types/type-any.js';

import { deepMerge } from '@ez4/utils';

import { isObjectSchema } from '../types/type-object.js';
import { isUnionSchema } from '../types/type-union.js';

export type SchemaProperties = {
  [property: string]: SchemaProperties | boolean;
};

export const hasSchemaProperty = (schema: AnySchema, property: string): boolean => {
  if (isObjectSchema(schema)) {
    return !!schema.properties[property];
  }

  if (isUnionSchema(schema)) {
    return schema.elements.some((schema) => hasSchemaProperty(schema, property));
  }

  return false;
};

export const getObjectSchemaProperties = (schema: ObjectSchema) => {
  const properties: SchemaProperties = {};

  for (const propertyName in schema.properties) {
    const propertyValue = schema.properties[propertyName];

    if (isObjectSchema(propertyValue) && !propertyValue.definitions?.extensible && !propertyValue.additional) {
      properties[propertyName] = getObjectSchemaProperties(propertyValue);
    } else if (isUnionSchema(propertyValue)) {
      properties[propertyName] = getUnionSchemaProperties(propertyValue);
    } else {
      properties[propertyName] = true;
    }
  }

  return properties;
};

export const getUnionSchemaProperties = (schema: UnionSchema) => {
  let properties: SchemaProperties = {};

  for (const element of schema.elements) {
    if (isObjectSchema(element)) {
      properties = deepMerge(properties, getObjectSchemaProperties(element));
    } else if (isUnionSchema(element)) {
      properties = deepMerge(properties, getUnionSchemaProperties(element));
    }
  }

  return properties;
};

export const getArraySchemaProperties = (schema: ArraySchema) => {
  const element = schema.element;

  if (isObjectSchema(element)) {
    return getObjectSchemaProperties(element);
  } else if (isUnionSchema(element)) {
    return getUnionSchemaProperties(element);
  }

  return {};
};

export const getTupleSchemaProperties = (schema: TupleSchema) => {
  let properties: SchemaProperties = {};

  for (const element of schema.elements) {
    if (isObjectSchema(element)) {
      properties = deepMerge(properties, getObjectSchemaProperties(element));
    } else if (isUnionSchema(element)) {
      properties = deepMerge(properties, getUnionSchemaProperties(element));
    }
  }

  return properties;
};
