import type { AllType, ReflectionTypes, TypeCallback, TypeFunction, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { TopicEventSchema } from './types';

import { createUnionSchema, getIntersectionSchema, getObjectSchema } from '@ez4/schema/library';
import { isTypeIntersection, isTypeObject, isTypeReference, isTypeUnion } from '@ez4/reflection';
import { getReferenceType, hasHeritageType, isModelDeclaration } from '@ez4/common/library';
import { isObjectSchema } from '@ez4/schema';

import { IncorrectEventTypeError, InvalidEventTypeError } from '../errors/event';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const isTopicEventDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Topic.Event');
};

export const getTopicEventMetadata = (type: AllType, parent: TypeParent, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getEventType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getEventType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getEventType = (type: AllType, parent: TypeParent, reflection: ReflectionTypes, errorList: Error[]): TopicEventSchema | undefined => {
  if (isTypeUnion(type)) {
    return getEventFromUnion(type.elements, parent, reflection, errorList);
  }

  if (isTypeIntersection(type)) {
    return getEventFromIntersection(type, reflection);
  }

  if (isTypeObject(type)) {
    return getEventSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEventTypeError(parent.file));
    return undefined;
  }

  if (!isTopicEventDeclaration(type)) {
    errorList.push(new IncorrectEventTypeError(type.name, type.file));
    return undefined;
  }

  return getEventSchema(type, reflection);
};

const getEventFromUnion = (types: AllType[], parent: TypeParent, reflection: ReflectionTypes, errorList: Error[]) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getTopicEventMetadata(type, parent, reflection, errorList);

    if (schema) {
      schemaList.push(schema);
    }
  }

  return createUnionSchema({
    elements: schemaList
  });
};

const getEventFromIntersection = (type: TypeObject | TypeModel | TypeIntersection, reflection: ReflectionTypes) => {
  const schema = getIntersectionSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};

const getEventSchema = (type: TypeObject | TypeModel | TypeIntersection, reflection: ReflectionTypes) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};
