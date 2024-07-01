import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { isModelDeclaration } from '@ez4/common/library';
import { getObjectSchema } from '@ez4/schema/library';

import { IncorrectQueryTypeError, InvalidQueryTypeError } from '../errors/query.js';
import { isHttpQuery } from './utils.js';

export const getHttpQuery = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeQuery(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeQuery(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeQuery = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getObjectSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidQueryTypeError(parent.file));
    return null;
  }

  if (!isHttpQuery(type)) {
    errorList.push(new IncorrectQueryTypeError(type.name, parent.file));
    return null;
  }

  return getObjectSchema(type, reflection);
};
