import type { AllType, ReflectionTypes, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { getReferenceType, hasHeritageType, isModelDeclaration } from '@ez4/common/library';
import { isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectQueryTypeError, InvalidQueryTypeError } from '../errors/query';
import { getSchemaFromIntersection, getSchemaFromObject } from './utils/schema';
import { getFullTypeName } from './utils/name';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

const BASE_TYPE = 'QueryStrings';

export const isWebQueryDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getWebQueryMetadata = (
  type: AllType,
  parent: TypeParent,
  reflection: ReflectionTypes,
  errorList: Error[],
  namespace: string
) => {
  if (!isTypeReference(type)) {
    return getQueryType(type, parent, reflection, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getQueryType(declaration, parent, reflection, errorList, namespace);
  }

  return undefined;
};

const getQueryType = (type: AllType, parent: TypeParent, reflection: ReflectionTypes, errorList: Error[], namespace: string) => {
  if (isTypeObject(type)) {
    return getSchemaFromObject(type, reflection);
  }

  if (isTypeIntersection(type)) {
    return getSchemaFromIntersection(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidQueryTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isWebQueryDeclaration(type, namespace)) {
    errorList.push(new IncorrectQueryTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  return getSchemaFromObject(type, reflection);
};
