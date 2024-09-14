import type { Incomplete } from '@ez4/utils';
import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { CdnOrigin } from '../types/origin.js';

import {
  getLinkedServiceName,
  getModelMembers,
  getObjectMembers,
  getPropertyString,
  isModelDeclaration
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import {
  IncompleteOriginError,
  IncorrectOriginTypeError,
  InvalidOriginTypeError
} from '../errors/origin.js';

import { isCdnOrigin } from './utils.js';

type TypeParent = TypeModel | TypeObject;

export const getCdnOrigin = (
  type: AllType,
  parent: TypeParent,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeOrigin(type, parent, reflection, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeOrigin(statement, parent, reflection, errorList);
  }

  return null;
};

const isValidOrigin = (type: Incomplete<CdnOrigin>): type is CdnOrigin => {
  return !!type.bucket;
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
  type: TypeObject | TypeModel,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const origin: Incomplete<CdnOrigin> = {};
  const properties = new Set(['bucket']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'bucket': {
        const value = getLinkedServiceName(member, type, reflection, errorList);
        if (value !== undefined && value !== null) {
          origin[member.name] = value;
        }
        break;
      }

      case 'path': {
        const value = getPropertyString(member);
        if (value !== undefined && value !== null) {
          origin[member.name] = value;
        }
        break;
      }
    }
  }

  if (isValidOrigin(origin)) {
    return origin;
  }

  errorList.push(new IncompleteOriginError([...properties], type.file));

  return null;
};
