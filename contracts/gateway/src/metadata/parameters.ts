import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';
import { getReferenceType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectParameterTypeError, InvalidParameterTypeError } from '../errors/parameters';
import { getSchemaFromType } from './schema';
import { isHttpParameters } from './utils';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

export const getHttpParameters = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeParameter(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeParameter(declaration, parent, reflection, errorList);
  }

  return null;
};

const getTypeParameter = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type) || isTypeIntersection(type)) {
    return getSchemaFromType(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidParameterTypeError(parent.file));
    return null;
  }

  if (!isHttpParameters(type)) {
    errorList.push(new IncorrectParameterTypeError(type.name, type.file));
    return null;
  }

  return getSchemaFromType(type, reflection);
};
