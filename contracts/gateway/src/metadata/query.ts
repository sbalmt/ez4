import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectQueryTypeError, InvalidQueryTypeError } from '../errors/query';
import { getSchemaFromType } from './schema';
import { isHttpQuery } from './utils';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

export const getHttpQuery = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeQuery(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeQuery(declaration, parent, reflection, errorList);
  }

  return null;
};

const getTypeQuery = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type) || isTypeIntersection(type)) {
    return getSchemaFromType(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidQueryTypeError(parent.file));
    return null;
  }

  if (!isHttpQuery(type)) {
    errorList.push(new IncorrectQueryTypeError(type.name, parent.file));
    return null;
  }

  return getSchemaFromType(type, reflection);
};
