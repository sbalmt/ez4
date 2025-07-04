import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { ObjectSchema, ObjectSchemaProperties } from '../types/type-object.js';
import type { ReferenceSchema } from '../types/type-reference.js';
import type { SchemaContext } from '../types/context.js';

import { isTypeIntersection, isTypeModel, isTypeObject, isTypeReference } from '@ez4/reflection';

import { getModelProperties } from '../reflection/model.js';
import { getObjectProperties } from '../reflection/object.js';
import { SchemaReferenceNotFound } from '../errors/reference.js';
import { SchemaDefinitions, SchemaType } from '../types/common.js';
import { createSchemaContext } from '../types/context.js';
import { isObjectSchema } from '../types/type-object.js';
import { createReferenceSchema } from './reference.js';
import { getAnySchema } from './any.js';

type RichTypeBase = {
  definitions?: SchemaDefinitions;
};

export type RichTypeObject = TypeObject & RichTypeBase;

export type RichTypeModel = TypeModel & RichTypeBase;

export const createObjectSchema = (data: Omit<ObjectSchema, 'type'>): ObjectSchema => {
  const { description, identity, optional, nullable, definitions, additional, properties } = data;

  return {
    type: SchemaType.Object,
    ...(description && { description }),
    ...(optional && { optional }),
    ...(nullable && { nullable }),
    ...(definitions && { definitions }),
    ...(additional && { additional }),
    properties,
    identity
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
  context = createSchemaContext(),
  description?: string
): ObjectSchema | ReferenceSchema | null => {
  const { references } = context;

  if (references.has(type)) {
    return createReferenceSchema({
      identity: references.get(type)!
    });
  }

  if (isRichTypeObject(type)) {
    const identity = ++context.counter;

    references.set(type, identity);

    const objectSchema = createObjectSchema({
      properties: getAnySchemaFromMembers(reflection, context, getObjectProperties(type)),
      additional: getAnySchemaFromDynamicMembers(reflection, context, type),
      definitions: type.definitions,
      description,
      identity
    });

    references.delete(type);

    return objectSchema;
  }

  if (isRichTypeModel(type)) {
    const identity = ++context.counter;

    references.set(type, identity);

    const modelSchema = createObjectSchema({
      properties: getAnySchemaFromMembers(reflection, context, getModelProperties(type)),
      description: description ?? type.description,
      definitions: type.definitions,
      identity
    });

    references.delete(type);

    return modelSchema;
  }

  if (isTypeIntersection(type)) {
    const identity = ++context.counter;

    references.set(type, identity);

    const objectSchema = createObjectSchema({
      properties: {},
      description,
      identity
    });

    for (const element of type.elements) {
      const elementSchema = getObjectSchema(element, reflection, context);

      if (!elementSchema || !isObjectSchema(elementSchema)) {
        continue;
      }

      const hasDefinitions = !!objectSchema.definitions || !!elementSchema.definitions;
      const hasAdditional = !!objectSchema.additional || !!elementSchema.additional;

      Object.assign(objectSchema, {
        ...(hasAdditional && { additional: elementSchema.additional ?? objectSchema.additional }),
        ...(hasDefinitions && {
          definitions: {
            ...objectSchema.definitions,
            ...elementSchema.definitions
          }
        }),
        properties: {
          ...objectSchema.properties,
          ...elementSchema.properties
        }
      });
    }

    references.delete(type);

    return objectSchema;
  }

  if (isTypeReference(type)) {
    const declaration = reflection[type.path];

    if (!declaration) {
      throw new SchemaReferenceNotFound(type.path);
    }

    return getObjectSchema(declaration, reflection, context, description);
  }

  return null;
};

const getAnySchemaFromMembers = (reflection: SourceMap, context: SchemaContext, members: ModelProperty[]) => {
  const properties: ObjectSchemaProperties = {};

  for (const member of members) {
    const { name, value, description } = member;

    const schema = getAnySchema(value, reflection, context, description);

    if (schema) {
      properties[name] = schema;
    }
  }

  return properties;
};

const getAnySchemaFromDynamicMembers = (reflection: SourceMap, context: SchemaContext, type: TypeObject) => {
  if (!type.members || Array.isArray(type.members)) {
    return;
  }

  const propertySchema = getAnySchema(type.members.index, reflection, context);

  if (!propertySchema) {
    return;
  }

  const valueSchema = getAnySchema(type.members.value, reflection, context);

  if (!valueSchema) {
    return;
  }

  return {
    property: propertySchema,
    value: valueSchema
  };
};
