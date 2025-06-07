import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { HttpErrors } from '../types/common.js';

import { InvalidServicePropertyError, getObjectMembers, getPropertyTuple, getReferenceType } from '@ez4/common/library';
import { isAnyNumber, isEmptyObject } from '@ez4/utils';

import { isModelProperty, isTypeClass, isTypeObject, isTypeReference } from '@ez4/reflection';
import { InvalidRouteErrorTypeError } from '../library.js';

export const getHttpErrors = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeErrors(type, parent, reflection, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeErrors(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeErrors = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), reflection, errorList);
  }

  return null;
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  parent: TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const errors: HttpErrors = {};

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
      Object.assign(errors, errorMap);
    }
  }

  if (!isEmptyObject(errors)) {
    return errors;
  }

  return null;
};

export const getErrorClasses = (member: ModelProperty, errorCode: number, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  const errorTypes = getPropertyTuple(member) ?? [];
  const errorMap: HttpErrors = {};

  for (const errorType of errorTypes) {
    if (!isTypeReference(errorType)) {
      errorList.push(new InvalidRouteErrorTypeError(parent.file));
      continue;
    }

    const statement = getReferenceType(errorType, reflection);

    if (!statement || !isTypeClass(statement)) {
      errorList.push(new InvalidRouteErrorTypeError(parent.file));
      continue;
    }

    errorMap[statement.name] = errorCode;
  }

  return errorMap;
};
