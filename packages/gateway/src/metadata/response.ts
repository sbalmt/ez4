import type { AllType, SourceMap, TypeCallback, TypeFunction, TypeModel } from '@ez4/reflection';

import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { isModelDeclaration } from '@ez4/common/library';
import { getObjectSchema } from '@ez4/schema/library';

import { IncorrectResponseTypeError, InvalidResponseTypeError } from '../errors/response.js';
import { isHttpResponse } from './utils.js';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const getHttpResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeResponse(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeResponse(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getObjectSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidResponseTypeError(parent.file));
    return null;
  }

  if (!isHttpResponse(type)) {
    errorList.push(new IncorrectResponseTypeError(type.name, type.file));
    return null;
  }

  return getObjectSchema(type, reflection);
};
