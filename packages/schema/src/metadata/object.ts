import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { ObjectSchema, ObjectSchemaProperties } from '../types/object.js';

import { isTypeModel, isTypeObject, isTypeReference } from '@ez4/reflection';

import { getObjectProperties } from '../reflection/object.js';
import { getModelProperties } from '../reflection/model.js';
import { SchemaDefinitions, SchemaType } from '../types/common.js';
import { getAnySchema } from './any.js';

const circularRefs = new WeakSet<AllType>();

type RichTypeBase = {
  definitions?: SchemaDefinitions;
};

export type RichTypeObject = TypeObject & RichTypeBase;

export type RichTypeModel = TypeModel & RichTypeBase;

export const createObjectSchema = (data: Omit<ObjectSchema, 'type'>): ObjectSchema => {
  const { properties, description, optional, nullable, definitions } = data;

  return {
    type: SchemaType.Object,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(definitions && { definitions }),
    properties
  };
};

export const isRichTypeObject = (type: AllType): type is RichTypeObject => {
  return isTypeObject(type);
};

export const isRichTypeModel = (type: AllType): type is RichTypeModel => {
  return isTypeModel(type);
};

export const getObjectSchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): ObjectSchema | null => {
  if (circularRefs.has(type)) {
    return createObjectSchema({
      properties: {},
      definitions: {
        extensible: true
      }
    });
  }

  circularRefs.add(type);

  const schema = getRawObjectSchema(type, reflection, description);

  circularRefs.delete(type);

  return schema;
};

const getRawObjectSchema = (
  type: AllType,
  reflection: SourceMap,
  description?: string
): ObjectSchema | null => {
  if (isRichTypeObject(type)) {
    return createObjectSchema({
      properties: getAnySchemaFromMembers(reflection, getObjectProperties(type)),
      definitions: type.definitions,
      description,
    });
  }

  if (isRichTypeModel(type)) {
    return createObjectSchema({
      properties: getAnySchemaFromMembers(reflection, getModelProperties(type)),
      description: description ?? type.description,
      definitions: type.definitions
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
