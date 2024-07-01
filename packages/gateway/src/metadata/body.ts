import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { AnySchema } from '@ez4/schema';

import { isTypeObject, isTypeReference, isTypeUnion } from '@ez4/reflection';
import { createUnionSchema, getObjectSchema } from '@ez4/schema/library';
import { isModelDeclaration } from '@ez4/common/library';

import { IncorrectBodyTypeError, InvalidBodyTypeError } from '../errors/body.js';
import { isJsonBody } from './utils.js';

export const getHttpBody = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeBody(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeBody(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeBody = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
): AnySchema | null => {
  if (isTypeUnion(type)) {
    return getBodyFromUnion(type.elements, parent, reflection, errorList);
  }

  if (isTypeObject(type)) {
    return getObjectSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidBodyTypeError(parent.file));
    return null;
  }

  if (!isJsonBody(type)) {
    errorList.push(new IncorrectBodyTypeError(type.name, type.file));
    return null;
  }

  return getObjectSchema(type, reflection);
};

const getBodyFromUnion = (
  types: AllType[],
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  const schemaList = [];

  for (const type of types) {
    const schema = getHttpBody(type, parent, reflection, errorList);

    if (schema) {
      schemaList.push(schema);
    }
  }

  return createUnionSchema({
    elements: schemaList
  });
};
