import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpCors } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLiteralString,
  getModelMembers,
  getObjectMembers,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyTuple,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteCorsError, IncorrectCorsTypeError, InvalidCorsTypeError } from '../errors/cors.js';
import { isHttpCors } from './utils.js';

export const getHttpCors = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeCors(type, parent, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeCors(statement, parent, errorList);
  }

  return null;
};

const isValidCors = (type: Incomplete<HttpCors>): type is HttpCors => {
  return !!type.allowOrigins?.length;
};

const getTypeCors = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCorsTypeError(parent.file));
    return null;
  }

  if (!isHttpCors(type)) {
    errorList.push(new IncorrectCorsTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const cors: Incomplete<HttpCors> = {};
  const properties = new Set(['allowOrigins']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'allowOrigins':
      case 'allowMethods':
      case 'allowHeaders':
      case 'exposeHeaders':
        cors[member.name] = getStringValues(member);
        break;

      case 'allowCredentials':
        cors.allowCredentials = getPropertyBoolean(member);
        break;

      case 'maxAge':
        cors.maxAge = getPropertyNumber(member);
        break;
    }
  }

  if (isValidCors(cors)) {
    return cors;
  }

  errorList.push(new IncompleteCorsError([...properties], type.file));

  return null;
};

const getStringValues = (member: ModelProperty) => {
  const stringItems = getPropertyTuple(member) ?? [];
  const stringList: string[] = [];

  for (const item of stringItems) {
    const result = getLiteralString(item);

    if (result) {
      stringList.push(result);
    }
  }

  return stringList;
};
