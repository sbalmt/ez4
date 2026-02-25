import type { AllType, ReflectionTypes, TypeModel } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { WsDefaults } from './types';

import {
  InvalidServicePropertyError,
  isModelDeclaration,
  getPropertyNumber,
  getObjectMembers,
  getModelMembers,
  getServiceListener,
  getServiceArchitecture,
  getServiceLogLevel,
  getServiceRuntime,
  tryGetReferenceType,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeObject, isTypeReference } from '@ez4/reflection';

import { IncorrectDefaultsTypeError, InvalidDefaultsTypeError } from '../../errors/defaults';
import { getFullTypeName } from '../utils/name';
import { getWebPreferencesMetadata } from '../preferences';
import { WsNamespaceType } from './types';

export const FULL_BASE_TYPE = getFullTypeName(WsNamespaceType, 'Defaults');

export const isWsDefaultsDeclaration = (type: TypeModel) => {
  return hasHeritageType(type, FULL_BASE_TYPE);
};

export const getWsDefaultsMetadata = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getDefaultsType(type, parent, reflection, errorList);
  }

  const declaration = tryGetReferenceType(type, reflection);

  if (declaration) {
    return getDefaultsType(declaration, parent, reflection, errorList);
  }

  return undefined;
};

const getDefaultsType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[]) => {
  if (isTypeObject(type)) {
    return getTypeFromMembers(parent, getObjectMembers(type), reflection, errorList);
  }

  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidDefaultsTypeError(FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  if (!isWsDefaultsDeclaration(type)) {
    errorList.push(new IncorrectDefaultsTypeError(type.name, FULL_BASE_TYPE, parent.file));
    return undefined;
  }

  return getTypeFromMembers(parent, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (parent: TypeModel, members: MemberType[], reflection: ReflectionTypes, errorList: Error[]) => {
  const defaults: WsDefaults = {};

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      default: {
        errorList.push(new InvalidServicePropertyError(parent.name, member.name, parent.file));
        break;
      }

      case 'preferences': {
        defaults.preferences = getWebPreferencesMetadata(member.value, parent, reflection, errorList, WsNamespaceType);
        break;
      }

      case 'memory':
      case 'timeout':
      case 'logRetention': {
        defaults[member.name] = getPropertyNumber(member);
        break;
      }

      case 'logLevel': {
        defaults[member.name] = getServiceLogLevel(member);
        break;
      }

      case 'architecture': {
        defaults[member.name] = getServiceArchitecture(member);
        break;
      }

      case 'runtime': {
        defaults[member.name] = getServiceRuntime(member);
        break;
      }

      case 'listener': {
        defaults.listener = getServiceListener(member.value, errorList);
        break;
      }
    }
  }

  return defaults;
};
