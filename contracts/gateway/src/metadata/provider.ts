import type { AllType, SourceMap, TypeIntersection, TypeModel, TypeObject } from '@ez4/reflection';
import type { MemberType } from '@ez4/common/library';
import type { Incomplete } from '@ez4/utils';
import type { HttpProvider } from '../types/common';

import { isModelDeclaration, getModelMembers, getReferenceType, getLinkedServiceList } from '@ez4/common/library';
import { isModelProperty, isTypeReference } from '@ez4/reflection';

import { IncompleteProviderError, InvalidProviderTypeError } from '../errors/provider';

export const getHttpProvider = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[]) => {
  if (!isTypeReference(type)) {
    return getProviderType(type, parent, reflection, errorList, 'Http.Provider');
  }

  const declaration = getReferenceType(type, reflection);

  if (declaration) {
    return getProviderType(declaration, parent, reflection, errorList, 'Http.Provider');
  }

  return null;
};

const isValidProvider = (type: Incomplete<HttpProvider>): type is HttpProvider => {
  return !!type.services;
};

const getProviderType = (type: AllType, parent: TypeModel, reflection: SourceMap, errorList: Error[], baseType: string) => {
  if (!isModelDeclaration(type)) {
    errorList.push(new InvalidProviderTypeError(baseType, parent.file));
    return null;
  }

  return getTypeFromMembers(type, getModelMembers(type), reflection, errorList);
};

const getTypeFromMembers = (
  type: TypeObject | TypeModel | TypeIntersection,
  members: MemberType[],
  reflection: SourceMap,
  errorList: Error[]
) => {
  const context: HttpProvider = {};
  const properties = new Set(['services']);

  for (const member of members) {
    if (!isModelProperty(member) || member.inherited) {
      continue;
    }

    switch (member.name) {
      case 'services':
        const services = getLinkedServiceList(member, reflection, errorList);

        if (services) {
          context.services = services;
        }

        properties.delete(member.name);
        break;
    }
  }

  if (isValidProvider(context)) {
    return context;
  }

  errorList.push(new IncompleteProviderError([...properties], type.file));

  return null;
};
