import type { MemberType } from '@ez4/common/library';
import type { AllType, SourceMap, TypeModel, TypeObject } from '@ez4/reflection';
import type { HttpDefaults } from '../types/common.js';

import {
  isModelDeclaration,
  getPropertyNumber,
  getObjectMembers,
  getModelMembers,
  getServiceListener
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';
import { isAnyNumber } from '@ez4/utils';

import { IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '../library.js';
import { isHttpDefaults } from './utils.js';

export const getHttpDefaults = (
  type: AllType,
  parent: TypeObject | TypeModel,
  reflection: SourceMap,
  errorList: Error[]
) => {
  if (!isTypeReference(type)) {
    return getTypeDefaults(type, parent, errorList);
  }

  const statement = reflection[type.path];

  if (statement) {
    return getTypeDefaults(statement, parent, errorList);
  }

  return null;
};

const getTypeDefaults = (type: AllType, parent: TypeObject | TypeModel, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(getObjectMembers(type), errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidDefaultsTypeError(parent.file));
    return null;
  }

  if (!isHttpDefaults(type)) {
    errorList.push(new IncorrectDefaultsTypeError(type.name, parent.file));
    return null;
  }

  return getTypeFromMembers(getModelMembers(type), errorList);
};

const getTypeFromMembers = (members: MemberType[], errorList: Error[]) => {
  const defaults: HttpDefaults = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'timeout':
      case 'memory': {
        const value = getPropertyNumber(member);

        if (isAnyNumber(value)) {
          defaults[member.name] = value;
        }

        break;
      }

      case 'listener': {
        const value = getServiceListener(member.value, errorList);

        if (value) {
          defaults.listener = value;
        }

        break;
      }
    }
  }

  return defaults;
};
