import type { CronEventSchema } from '../types/common';

import type { AllType, SourceMap, TypeCallback, TypeFunction, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { createUnionSchema, getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { isTypeIntersection, isTypeObject, isTypeReference, isTypeUnion } from '@ez4/reflection';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectEventTypeError, InvalidEventTypeError } from '../errors/event';
import { isCronEvent } from './utils';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const getCronEvent = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeEvent(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeEvent(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getTypeEvent = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]): CronEventSchema | undefined => {
  if (isTypeUnion(type)) {
    return getEventFromUnion(type.elements, parent, reflection, errorList);
  }

  if (isTypeObject(type) || isTypeIntersection(type)) {
    return getEventSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidEventTypeError(parent.file));
    return undefined;
  }

  if (!isCronEvent(type)) {
    errorList.push(new IncorrectEventTypeError(type.name, type.file));
    return undefined;
  }

  return getEventSchema(type, reflection);
};

const getEventFromUnion = (types: AllType[], parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getCronEvent(type, parent, reflection, errorList);

    if (schema) {
      schemaList.push(schema);
    }
  }

  return createUnionSchema({
    elements: schemaList
  });
};

const getEventSchema = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};
