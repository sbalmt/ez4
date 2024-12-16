import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeObject, isTypeReference } from '@ez4/reflection';
import { getObjectSchema, isObjectSchema } from '@ez4/schema/library';
import { isModelDeclaration } from '@ez4/common/library';

import { IncorrectParameterTypeError, InvalidParameterTypeError } from '../errors/parameters.js';
import { isHttpParameters } from './utils.js';

export const getHttpParameters = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeParameter(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeParameter(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeParameter = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getParameterSchema(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidParameterTypeError(parent.file));
    return null;
  }

  if (!isHttpParameters(type)) {
    errorList.push(new IncorrectParameterTypeError(type.name, type.file));
    return null;
  }

  return getParameterSchema(type, reflection);
};

const getParameterSchema = (type: TypeObject | TypeModel, reflection: SourceMap) => {
  const schema = getObjectSchema(type, reflection);

  if (schema && isObjectSchema(schema)) {
    return schema;
  }

  return null;
};
