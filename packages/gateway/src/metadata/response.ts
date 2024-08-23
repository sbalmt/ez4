import type { AllType, SourceMap, TypeCallback, TypeFunction, TypeModel } from '@ez4/reflection';

import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { hasHeritageType, isModelDeclaration } from '@ez4/common/library';
import { getObjectSchema } from '@ez4/schema/library';

import { IncorrectResponseTypeError, InvalidResponseTypeError } from '../errors/response.js';

type TypeParent = TypeModel | TypeCallback | TypeFunction;

export const getHttpAuthorizerResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  return getHttpResponse(type, parent, reflection, errorList, 'Http.AuthResponse');
};

export const getHttpHandlerResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  return getHttpResponse(type, parent, reflection, errorList, 'Http.Response');
};

const getHttpResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  baseType: string
) => {
  if (!isTypeReference(type)) {
    return getTypeResponse(type, parent, reflection, errorList, baseType);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeResponse(statement, parent, reflection, errorList, baseType);
  }

  return null;
};

const getTypeResponse = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  baseType: string
) => {
  if (isTypeObject(type)) {
    return getObjectSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidResponseTypeError(baseType, parent.file));
    return null;
  }

  if (!hasHeritageType(type, baseType)) {
    errorList.push(new IncorrectResponseTypeError(type.name, baseType, type.file));
    return null;
  }

  return getObjectSchema(type, reflection);
};
