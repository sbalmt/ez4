import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { isModelDeclaration } from '@ez4/common/library';
import { getObjectSchema } from '@ez4/schema/library';

import { IncorrectHeadersTypeError, InvalidHeadersTypeError } from '../errors/headers.js';
import { isHttpHeaders } from './utils.js';

export const getHttpHeaders = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeHeaders(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeHeaders(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeHeaders = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getObjectSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidHeadersTypeError(parent.file));
    return null;
  }

  if (!isHttpHeaders(type)) {
    errorList.push(new IncorrectHeadersTypeError(type.name, parent.file));
    return null;
  }

  return getObjectSchema(type, reflection);
};
