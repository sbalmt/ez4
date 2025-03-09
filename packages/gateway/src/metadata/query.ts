import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';

import { getReferenceType, isModelDeclaration } from '@ez4/common/library';
import { getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { isTypeObject, isTypeReference } from '@ez4/reflection';

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

  const statement = getReferenceType(type, reflection);

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
    return getQuerySchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidQueryTypeError(parent.file));
    return null;
  }

  if (!isHttpQuery(type)) {
    errorList.push(new IncorrectQueryTypeError(type.name, parent.file));
    return null;
  }

  return getQuerySchema(type, reflection);
};

const getQuerySchema = (type: TypeObject | TypeModel, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return null;
};
