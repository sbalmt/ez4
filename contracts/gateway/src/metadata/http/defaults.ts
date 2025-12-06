import type { AllType, SourceMap, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { HttpDefaults } from '../../types/common';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getPropertyNumber,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  tryGetReferenceType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '../../library';
import { getHttpPreferences } from './preferences';
import { isHttpDefaults } from './utils';
import { getHttpErrors } from './errors';

export const getHttpDefaults = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getTypeDefaults(type, parent, reflection, errorList);
  }

  const declaration = tryGetReferenceType(type, reflection);

  if (declaration) {
    return getTypeDefaults(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getTypeDefaults = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidDefaultsTypeError(parent.file));
    return undefined;
  }

  if (!isHttpDefaults(type)) {
    errorList.push(new IncorrectDefaultsTypeError(type.name, parent.file));
    return undefined;
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

      case 'preferences':
        defaults.preferences = getHttpPreferences(member.value, parent, reflection, errorList);
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
