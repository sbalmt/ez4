import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { CdnRegularOrigin, CdnBucketOrigin, CdnOrigin } from '../types/origin.js';

import {
  InvalidServicePropertyError,
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

import { IncompleteOriginError, IncorrectOriginTypeError, InvalidOriginTypeError } from '../errors/origin.js';
import { CdnOriginType } from '../types/origin.js';
import { getCdnCache } from './cache.js';
import { isCdnOrigin } from './utils.js';

export const getAllCdnOrigins = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
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

export const getCdnOrigin = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
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

const getTypeOrigin = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(type, getObjectMembers(type), parent, reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidOriginTypeError(parent.file));
    return null;
  }

  if (!isCdnOrigin(type)) {
    errorList.push(new IncorrectOriginTypeError(type.name, type.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), parent, reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel,
  members: MemberType[],
  parent: TypeModel,
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
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, type.file));
        break;

      case 'bucket':
        if ((origin.bucket = getLinkedServiceName(member, parent, reflection, errorList))) {
          origin.type = CdnOriginType.Bucket;
          properties.delete(member.name);
        }
        break;

      case 'domain':
        if ((origin.domain = getPropertyString(member))) {
          origin.type = CdnOriginType.Regular;
          properties.delete(member.name);
        }
        break;

      case 'path':
      case 'protocol':
      case 'location':
        if ((origin[member.name] = getPropertyString(member))) {
          properties.delete(member.name);
        }
        break;

      case 'port':
        origin.port = getPropertyNumber(member);
        break;

      case 'headers':
        origin.headers = getOriginHeaders(member.value);
        break;

      case 'cache':
        origin.cache = getCdnCache(member.value, parent, reflection, errorList);
        break;
    }
  }

  if (isValidOrigin(origin)) {
    return origin;
  }

  errorList.push(new IncompleteOriginError([...properties], type.file));

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
