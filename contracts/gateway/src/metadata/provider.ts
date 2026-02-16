import type { AllType, ReflectionTypes, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpProvider } from './http/types';

import {
  isModelDeclaration,
  getModelMembers,
  getReferenceType,
  getLinkedServiceList,
  getLinkedVariableList,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteProviderError, InvalidProviderTypeError } from '../errors/http/provider';
import { getFullTypeName } from './utils/name';

const BASE_TYPE = 'Provider';

export const isWebProviderDeclaration = (type: AllType, namespace: string): type is TypeModel => {
  return isModelDeclaration(type) && hasHeritageType(type, getFullTypeName(namespace, BASE_TYPE));
};

export const getWebProviderMetadata = (
  type: AllType,
  parent: TypeModel,
  reflection: ReflectionTypes,
  errorList: Error[],
  namespace: string
) => {
  if (!isTypeReference(type)) {
    return getProviderType(type, parent, reflection, errorList, namespace);
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getProviderType(declaration, parent, reflection, errorList, namespace);
  }

  return undefined;
};

const isCompleteProvider = (type: Incomplete<HttpProvider>): type is HttpProvider => {
  return isObjectWith(type, ['services']);
};

const getProviderType = (type: AllType, parent: TypeModel, reflection: ReflectionTypes, errorList: Error[], namespace: string) => {
  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidProviderTypeError(getFullTypeName(namespace, BASE_TYPE), parent.file));
    return undefined;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel | TypeIntersection,
  members: MemberType[],
  reflection: ReflectionTypes,
  errorList: Error[]
) => {
  const provider: HttpProvider = {};
  const properties = new Set(['services']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'variables': {
        provider.variables = getLinkedVariableList(member, errorList);
        break;
      }

      case 'services': {
        if ((provider.services = getLinkedServiceList(member, reflection, errorList))) {
          properties.delete(member.name);
        }
        break;
      }
    }
  }

  if (!isCompleteProvider(provider)) {
    errorList.push(new IncompleteProviderError([...properties], type.file));
    return undefined;
  }

  return provider;
};
