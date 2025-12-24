import type { AllType, ModelProperty, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { HttpErrors } from './types';

import { InvalidServicePropertyError, getObjectMembers, getPropertyTuple, getReferenceType } from '@ez4/common/library';
import { isModelProperty, isTypeClass, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber, isEmptyObject } from '@ez4/utils';

import { InvalidRouteErrorTypeError } from '../../errors/http/route';

export const getHttpErrorsMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getErrorsType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getErrorsType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getErrorsType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  return undefined;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const httpErrors: HttpErrors = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    const errorCode = parseInt(member.name, 10);

    if (!isAnyNumber(errorCode)) {
      errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
    }

    const errorMap = getErrorClasses(member, errorCode, parent, reflection, errorList);

    if (errorMap) {
      Object.assign(httpErrors, errorMap);
    }
  }

  if (!isEmptyObject(httpErrors)) {
    return httpErrors;
  }

  return undefined;
};

export const getErrorClasses = (
  member: ModelProperty,
  errorCode: number,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const errorTypes = getPropertyTuple(member) ?? [];
  const errorMap: HttpErrors = {};

  for (const errorType of errorTypes) {
    if (!isTypeReference(errorType)) {
      errorList.push(new InvalidRouteErrorTypeError(parent.file));
      continue;
    }

    const declaration = getReferenceType(errorType, reflection);

    if (!declaration || !isTypeClass(declaration)) {
      errorList.push(new InvalidRouteErrorTypeError(parent.file));
      continue;
    }

    errorMap[declaration.name] = errorCode;
  }

  return errorMap;
};
