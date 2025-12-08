import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';

import { isTypeIntersection, isTypeObject, isTypeReference } from '@ez4/reflection';
import { getReferenceType, hasHeritageType, isModelDeclaration } from '@ez4/common/library';

import { IncorrectHeadersTypeError, InvalidHeadersTypeError } from '../errors/headers';
import { getSchemaFromIntersection, getSchemaFromObject } from './utils/schema';
import { getFullTypeName } from './utils/type';

type TypeParent = TypeObject | TypeModel | TypeIntersection;

const BASE_TYPE = 'Headers';

export const isWebHeadersDeclaration = (type: TypeModel, namespace: string) => {
  return hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getWebHeadersMetadata = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[], namespace: string) => {
  if (!isTypeReference(type)) {
    return getHeadersType(type, parent, reflection, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getHeadersType(declaration, parent, reflection, errorList, namespace);
  }

  return undefined;
};

const getHeadersType = (type: AllType, parent: TypeParent, reflection: SourceMap, errorList: Error[], namespace: string) => {
  if (isTypeObject(type)) {
    return getSchemaFromObject(type, reflection);
  }

  if (isTypeIntersection(type)) {
    return getSchemaFromIntersection(type, reflection);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidHeadersTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  if (!isWebHeadersDeclaration(type, namespace)) {
    errorList.push(new IncorrectHeadersTypeError(type.name, getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  return getSchemaFromObject(type, reflection);
};
