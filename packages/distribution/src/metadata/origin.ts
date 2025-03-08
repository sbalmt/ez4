import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { CdnRegularOrigin, CdnBucketOrigin, CdnOrigin } from '../types/origin.js';

import {
  isModelDeclaration,
  getLinkedServiceName,
  getLiteralTuple,
  getObjectMembers,
  getModelMembers,
  getPropertyNumber,
  getPropertyString,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import {
  IncompleteOriginError,
  IncorrectOriginTypeError,
  InvalidOriginTypeError
} from '../errors/origin.js';

import { CdnOriginType } from '../types/origin.js';
import { getCdnCache } from './cache.js';
import { isCdnOrigin } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getAllCdnOrigins = (
  type: AllType,
  parent: TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  const originItems = getLiteralTuple(type) ?? [];
  const resultList: CdnOrigin[] = [];

  for (const origin of originItems) {
    const result = getCdnOrigin(origin, parent, reflection, errorList);

    if (result) {
      resultList.push(result);
    }
  }

  return resultList;
};

export const getCdnOrigin = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeOrigin(type, parent, reflection, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeOrigin(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidOrigin = (type: Incomplete<CdnRegularOrigin & CdnBucketOrigin>): type is CdnOrigin => {
  return !!type.type && (!!type.domain || !!type.bucket);
};

const getTypeOrigin = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidOriginTypeError(parent.file));
    return null;
  }

  if (!isCdnOrigin(type)) {
    errorList.push(new IncorrectOriginTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  parent: TypeParent,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const origin: Incomplete<CdnRegularOrigin & CdnBucketOrigin> = {};
  const properties = new Set(['domain', 'bucket']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'bucket': {
        const bucketService = getLinkedServiceName(member, parent, reflection, errorList);
        if (bucketService) {
          origin.bucket = bucketService;
          origin.type = CdnOriginType.Bucket;
          properties.delete(member.name);
        }
        break;
      }

      case 'domain': {
        const domainUrl = getPropertyString(member);
        if (domainUrl) {
          origin.domain = domainUrl;
          origin.type = CdnOriginType.Regular;
          properties.delete(member.name);
        }
        break;
      }

      case 'location':
      case 'path': {
        const value = getPropertyString(member);
        if (value) {
          properties.delete(member.name);
          origin[member.name] = value;
        }
        break;
      }

      case 'headers': {
        const headers = getOriginHeaders(member.value);
        if (headers) {
          origin[member.name] = headers;
        }
        break;
      }

      case 'protocol': {
        const value = getPropertyString(member);
        if (value) {
          origin[member.name] = value;
        }
        break;
      }

      case 'port': {
        const value = getPropertyNumber(member);
        if (isAnyNumber(value)) {
          origin[member.name] = value;
        }
        break;
      }

      case 'cache': {
        const value = getCdnCache(member.value, parent, reflection, errorList);
        if (value) {
          origin[member.name] = value;
        }
        break;
      }
    }
  }

  if (isValidOrigin(origin)) {
    return origin;
  }

  errorList.push(new IncompleteOriginError([...properties], parent.file));

  return null;
};

const getOriginHeaders = (type: AllType) => {
  if (!isTypeObject(type)) {
    return null;
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
