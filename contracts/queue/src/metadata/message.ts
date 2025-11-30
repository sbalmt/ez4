import type { AllType, SourceMap, TypeCallback, TypeFunction, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { QueueMessageSchema } from '../types/common';

import { createUnionSchema, getIntersectionSchema, getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { isTypeIntersection, isTypeObject, isTypeReference, isTypeUnion } from '@ez4/reflection';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectMessageTypeError, InvalidMessageTypeError } from '../errors/message';
import { isQueueMessage } from './utils';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const getQueueMessage = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeMessage(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeMessage(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getTypeMessage = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]): QueueMessageSchema | undefined => {
  if (isTypeUnion(type)) {
    return getMessageFromUnion(type.elements, parent, reflection, errorList);
  }

  if (isTypeIntersection(type)) {
    return getMessageFromIntersection(type, reflection);
  }

  if (isTypeObject(type)) {
    return getMessageSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidMessageTypeError(parent.file));
    return undefined;
  }

  if (!isQueueMessage(type)) {
    errorList.push(new IncorrectMessageTypeError(type.name, type.file));
    return undefined;
  }

  return getMessageSchema(type, reflection);
};

const getMessageFromUnion = (types: AllType[], parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getQueueMessage(type, parent, reflection, errorList);

    if (schema) {
      schemaList.push(schema);
    }
  }

  return createUnionSchema({
    elements: schemaList
  });
};

const getMessageFromIntersection = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getIntersectionSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};

const getMessageSchema = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};
