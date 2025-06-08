import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { HttpDefaults } from '../types/common.js';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getPropertyNumber,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  getReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '../library.js';
import { isHttpDefaults } from './utils.js';
import { getHttpErrors } from './errors.js';

export const getHttpDefaults = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeDefaults(type, parent, reflection, errorList);
  }

  const statement = getReferenceType(type, reflection);

  if (statement) {
    return getTypeDefaults(statement, parent, reflection, errorList);
  }

  return null;
};

const getTypeDefaults = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidDefaultsTypeError(parent.file));
    return null;
  }

  if (!isHttpDefaults(type)) {
    errorList.push(new IncorrectDefaultsTypeError(type.name, parent.file));
    return null;
  }

  return getTypeFromMembers(parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (parent: TypeModel, members: MemberType[], reflection: SourceMap, errorList: Error[]) => {
  const defaults: HttpDefaults = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default:
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, parent.file));
        break;

      case 'httpErrors':
        defaults.httpErrors = getHttpErrors(member.value, parent, reflection, errorList);
        break;

      case 'memory':
      case 'logRetention':
      case 'timeout':
        defaults[member.name] = getPropertyNumber(member);
        break;

      case 'listener':
        defaults.listener = getServiceListener(member.value, errorList);
        break;
    }
  }

  return defaults;
};
