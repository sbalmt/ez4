import type { AllType, ReflectionTypes, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnRegularOrigin, CdnBucketOrigin, CdnOrigin } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getLinkedServiceName,
  getLiteralTuple,
  getObjectMembers,
  getModelMembers,
  getPropertyNumber,
  getPropertyString,
  getReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteOriginError, IncorrectOriginTypeError, InvalidOriginTypeError } from '../errors/origin';
import { getCdnCacheMetadata } from './cache';
import { CdnOriginType } from './types';

export const isCdnOriginDeclaration = (type: TypeModel) => {
  return (
    hasHeritageType(type, 'Cdn.DefaultRegularOrigin') ||
    hasHeritageType(type, 'Cdn.DefaultBucketOrigin') ||
    hasHeritageType(type, 'Cdn.RegularOrigin') ||
    hasHeritageType(type, 'Cdn.BucketOrigin')
  );
};

export const getCdnOriginsMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  const originItems = getLiteralTuple(type) ?? [];
  const resultList: CdnOrigin[] = [];

  for (const origin of originItems) {
    const result = getCdnOriginMetadata(origin, parent, reflection, errorList);

    if (result) {
      resultList.push(result);
    }
  }

  return resultList;
};

export const getCdnOriginMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getOriginType(type, parent, reflection, errorList);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getOriginType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const isCompleteOrigin = (type: Incomplete<CdnRegularOrigin & CdnBucketOrigin>): type is CdnOrigin => {
  return isObjectWith(type, ['type', 'domain']) || isObjectWith(type, ['type', 'bucket']);
};

const getOriginType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), parent, reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidOriginTypeError(parent.file));
    return undefined;
  }

  if (!isCdnOriginDeclaration(type)) {
    errorList.push(new IncorrectOriginTypeError(type.name, type.file));
    return undefined;
  }

  return getTypeFromMembers(type, getModelMembers(type), parent, reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const origin: Incomplete<CdnRegularOrigin & CdnBucketOrigin> = {};
  const properties = new Set(['domain', 'bucket']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;
      }

      case 'bucket': {
        if ((origin.bucket = getLinkedServiceName(member, parent, reflection, errorList))) {
          origin.type = CdnOriginType.Bucket;
          properties.delete(member.name);
        }
        break;
      }

      case 'domain': {
        if ((origin.domain = getPropertyString(member))) {
          origin.type = CdnOriginType.Regular;
          properties.delete(member.name);
        }
        break;
      }

      case 'path':
      case 'protocol':
      case 'location': {
        if ((origin[member.name] = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;
      }

      case 'port': {
        origin.port = getPropertyNumber(member);
        break;
      }

      case 'headers': {
        origin.headers = getOriginHeaders(member.value);
        break;
      }

      case 'cache': {
        origin.cache = getCdnCacheMetadata(member.value, parent, reflection, errorList);
        break;
      }
    }
  }

  if (!isCompleteOrigin(origin)) {
    errorList.push(new IncompleteOriginError([...properties], type.file));
    return undefined;
  }

  return origin;
};

const getOriginHeaders = (type: AllType) => {
  if (!isTypeObject(type)) {
    return undefined;
  }

  const headers: Record<string, string> = {};

  for (const member of getObjectMembers(type)) {
    if (!isModelProperty(member)) {
      continue;
    }

    const value = getPropertyString(member);

    if (value) {
      headers[member.name] = value;
    }
  }

  return headers;
};
