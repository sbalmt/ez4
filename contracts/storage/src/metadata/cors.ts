import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { BucketCors } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getModelMembers,
  getObjectMembers,
  getPropertyNumber,
  getPropertyStringList,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncompleteCorsError, IncorrectCorsTypeError, InvalidCorsTypeError } from '../errors/cors';

export const isBucketCorsDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, 'Bucket.Cors');
};

export const getBucketCorsMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeCors(type, parent, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getTypeCors(declaration, parent, errorList);
  }

  return undefined;
};

const isCompleteCors = (type: Incomplete<BucketCors>): type is BucketCors => {
  return !!type.allowOrigins?.length;
};

const getTypeCors = (type: AllType, parent: TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, parent, getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidCorsTypeError(parent.file));
    return undefined;
  }

  if (!isBucketCorsDeclaration(type)) {
    errorList.push(new IncorrectCorsTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, parent, getModelMembers(type), errorList);
};

const getTypeFromMembers = (type: TypeObject | TypeModel, parent: TypeModel, members: MemberType[], errorList: Error[]) => {
  const cors: Incomplete<BucketCors> = {};
  const properties = new Set(['allowOrigins']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'allowOrigins':
      case 'allowMethods':
      case 'allowHeaders':
      case 'exposeHeaders': {
        cors[member.name] = getPropertyStringList(member);
        break;
      }

      case 'maxAge': {
        cors.maxAge = getPropertyNumber(member);
        break;
      }
    }
  }

  if (!isCompleteCors(cors)) {
    errorList.push(new IncompleteCorsError([...properties], type.file));
    return undefined;
  }

  return cors;
};
