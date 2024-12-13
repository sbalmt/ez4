import type { AllType, ModelProperty, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { BucketCors } from '../types/cors.js';

import {
  getLiteralString,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyTuple,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import {
  IncompleteCorsError,
  IncorrectCorsTypeError,
  InvalidCorsTypeError
} from '../errors/cors.js';

import { isBucketCors } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getBucketCors = (
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

const isValidCors = (type: Incomplete<BucketCors>): type is BucketCors => {
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

  if (!isBucketCors(type)) {
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
  const cors: Incomplete<BucketCors> = {};
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

      case 'maxAge': {
        const value = getPropertyNumber(member);
        if (isAnyNumber(value)) {
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
