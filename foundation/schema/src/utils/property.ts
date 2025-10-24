import type { ObjectSchema, ObjectSchemaProperty } from '../types/type-object';
import type { UnionSchema } from '../types/type-union';
import type { ArraySchema } from '../types/type-array';
import type { TupleSchema } from '../types/type-tuple';
import type { EnumSchema } from '../types/type-enum';
import type { AnySchema } from '../types/type-any';

import { deepEqual, deepMerge, isAnyNumber, isAnyString } from '@ez4/utils';

import { getObjectSchemaProperty, isObjectSchema } from '../types/type-object';
import { isNumberSchema } from '../types/type-number';
import { isStringSchema } from '../types/type-string';
import { isUnionSchema } from '../types/type-union';
import { SchemaType } from '../types/common';

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

export const getSchemaProperty = (schema: AnySchema, propertyName: string): ObjectSchemaProperty | UnionSchema | EnumSchema | undefined => {
  if (isObjectSchema(schema)) {
    return getObjectSchemaProperty(schema, propertyName);
  }

  if (!isUnionSchema(schema)) {
    return undefined;
  }

  const compounds: AnySchema[] = [];
  const scalars = [];

  for (const element of schema.elements) {
    const property = getSchemaProperty(element, propertyName);

    if (property) {
      if (isStringSchema(property) && isAnyString(property.definitions?.value)) {
        scalars.push(property);
        continue;
      }

      if (isNumberSchema(property) && isAnyNumber(property.definitions?.value)) {
        scalars.push(property);
        continue;
      }

      if (!compounds.some((current) => deepEqual(current, property))) {
        compounds.push(property);
      }
    }
  }

  if (compounds.length > 1) {
    return {
      type: SchemaType.Union,
      elements: [...scalars, ...compounds]
    };
  }

  if (scalars.length > 1) {
    return {
      type: SchemaType.Enum,
      options: scalars.map(({ definitions }) => ({
        value: definitions?.value!
      }))
    };
  }

  return compounds[0] ?? scalars[0];
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
