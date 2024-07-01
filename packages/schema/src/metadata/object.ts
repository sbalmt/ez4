import type { AllType, ModelProperty, SourceMap } from '@ez4/reflection';
import type { ObjectSchema, ObjectSchemaProperties } from '../types/object.js';

import { isTypeModel, isTypeObject, isTypeReference } from '@ez4/reflection';

import { getObjectProperties } from '../reflection/object.js';
import { getModelProperties } from '../reflection/model.js';
import { SchemaTypeName } from '../types/common.js';
import { getAnySchema } from './any.js';

export const createObjectSchema = (data: Omit<ObjectSchema, 'type'>): ObjectSchema => {
  const { properties, description, optional, nullable } = data;

  return {
    type: SchemaTypeName.Object,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    properties
  };
};

export const getObjectSchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): ObjectSchema | null => {
  if (isTypeObject(type)) {
    return createObjectSchema({
      properties: getAnySchemaFromMembers(reflection, getObjectProperties(type)),
      description
    });
  }

  if (isTypeModel(type)) {
    return createObjectSchema({
      properties: getAnySchemaFromMembers(reflection, getModelProperties(type)),
      description: description ?? type.description
    });
  }

  if (isTypeReference(type)) {
    const statement = reflection[type.path];

    if (statement) {
      return getObjectSchema(statement, reflection, description);
    }
  }

  return null;
};

const getAnySchemaFromMembers = (reflection: SourceMap, members: ModelProperty[]) => {
  const properties: ObjectSchemaProperties = {};

  for (const member of members) {
    const { name, value, description } = member;

    const schema = getAnySchema(value, reflection, description);

    if (schema) {
      properties[name] = schema;
    }
  }

  return properties;
};
