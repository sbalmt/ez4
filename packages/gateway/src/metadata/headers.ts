import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';

import { getReferenceType, isModelDeclaration } from '@ez4/common/library';
import { getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { isTypeObject, isTypeReference } from '@ez4/reflection';

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

  const statement = getReferenceType(type, reflection);

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
    return getHeaderSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidHeadersTypeError(parent.file));
    return null;
  }

  if (!isHttpHeaders(type)) {
    errorList.push(new IncorrectHeadersTypeError(type.name, parent.file));
    return null;
  }

  return getHeaderSchema(type, reflection);
};

const getHeaderSchema = (type: TypeObject | TypeModel, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return null;
};
