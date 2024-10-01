import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpCors } from '../types/cors.js';

import {
  getLiteralString,
  getModelMembers,
  getObjectMembers,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyTuple,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncompleteCorsError,
  IncorrectCorsTypeError,
  InvalidCorsTypeError
} from '../errors/cors.js';

import { isHttpCors } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getHttpCors = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeCors(type, parent, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeCors(statement, parent, errorList);
  }

  return null;
};

const isValidCors = (type: Incomplete<HttpCors>): type is HttpCors => {
  return !!type.allowOrigins?.length;
};

const getTypeCors = (type: AllType, parent: TypeParent, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCorsTypeError(parent.file));
    return null;
  }

  if (!isHttpCors(type)) {
    errorList.push(new IncorrectCorsTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  errorList: Error[]
) => {
  const cors: Incomplete<HttpCors> = {};
  const properties = new Set(['allowOrigins']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'allowOrigins':
      case 'allowMethods':
      case 'allowHeaders':
      case 'exposeHeaders': {
        const values = getStringValues(member);
        if (values.length) {
          cors[member.name] = values;
        }
        break;
      }

      case 'allowCredentials': {
        const value = getPropertyBoolean(member);
        if (value !== undefined && value !== null) {
          cors[member.name] = value;
        }
        break;
      }

      case 'maxAge': {
        const value = getPropertyNumber(member);
        if (value !== undefined && value !== null) {
          cors[member.name] = value;
        }
        break;
      }
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
