import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectHeadersTypeError, InvalidHeadersTypeError } from '../errors/headers.js';
import { getSchemaFromType } from './schema.js';
import { isHttpHeaders } from './utils.js';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

export const getHttpHeaders = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeHeaders(type, parent, reflection, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeHeaders(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeHeaders = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type) || isTypeIntersection(type)) {
    return getSchemaFromType(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidHeadersTypeError(parent.file));
    return null;
  }

  if (!isHttpHeaders(type)) {
    errorList.push(new IncorrectHeadersTypeError(type.name, parent.file));
    return null;
  }

  return getSchemaFromType(type, reflection);
};
