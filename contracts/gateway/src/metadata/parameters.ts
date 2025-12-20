import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';
import { getReferenceType, hasHeritageType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectParameterTypeError, InvalidParameterTypeError } from '../errors/parameters';
import { getSchemaFromIntersection, getSchemaFromObject } from './utils/schema';
import { getFullTypeName } from './utils/name';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

const BASE_TYPE = 'PathParameters';

export const isWebParametersDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getWebParametersMetadata = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[],
  namespace: string
) => {
  if (!isTypeReference(type)) {
    return getParametersType(type, parent, reflection, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getParametersType(declaration, parent, reflection, errorList, namespace);
  }

  return undefined;
};

const getParametersType = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[], namespace: string) => {
  if (isTypeObject(type)) {
    return getSchemaFromObject(type, reflection);
  }

  if (isTypeIntersection(type)) {
    return getSchemaFromIntersection(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidParameterTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isWebParametersDeclaration(type, namespace)) {
    errorList.push(new IncorrectParameterTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), type.file));
    return undefined;
  }

  return getSchemaFromObject(type, reflection);
};
