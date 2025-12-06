import type { AllType, SourceMap, TypeCallback, TypeFunction, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { UnionSchema } from '@ez4/schema/library';

import { createUnionSchema, getIntersectionSchema, getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { isTypeIntersection, isTypeObject, isTypeReference, isTypeUnion } from '@ez4/reflection';
import { getReferenceType, hasHeritageType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectEventTypeError, InvalidEventTypeError } from '../../errors/ws/event';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const isWsEventDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Ws.Event');
};

export const getWsEvent = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getEventType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getEventType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getEventType = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
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

  if (!isWsEventDeclaration(type)) {
    errorList.push(new IncorrectEventTypeError(type.name, type.file));
    return undefined;
  }

  return getEventSchema(type, reflection);
};

const getEventFromUnion = (types: AllType[], parent: TypeParent, reflection: SourceMap, errorList: Error[]): UnionSchema => {
  const schemaList = [];

  for (const type of types) {
    const schema = getWsEvent(type, parent, reflection, errorList);

    if (schema) {
      schemaList.push(schema);
    }
  }

  return createUnionSchema({
    elements: schemaList
  });
};

const getEventFromIntersection = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getIntersectionSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};

const getEventSchema = (type: TypeObject | TypeModel | TypeIntersection, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return undefined;
};
