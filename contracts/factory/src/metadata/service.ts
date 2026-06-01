import type { AllType, ReflectionTypes, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { FactoryService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedVariablesObject,
  getLinkedServicesObject,
  getDeclarationDescription,
  getModelMembers,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../errors/service';
import { getFactoryHandlerMetadata } from './handler';
import { createFactoryService } from './types';

export const isFactoryServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Factory.Service');
};

export const getFactoryServicesMetadata = (reflection: ReflectionTypes) => {
  const allServices: Record<string, FactoryService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isFactoryServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const { file: fileName } = declaration;

    const service = createFactoryService(declaration.name, getDeclarationDescription(declaration));
    const properties = new Set(['handler']);

    for (const member of getModelMembers(declaration)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default: {
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;
        }

        case 'options':
          break;

        case 'handler': {
          if ((service.handler = getFactoryHandlerMetadata(member.value, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'variables': {
          service.variables = getLinkedVariablesObject(member, errorList);
          break;
        }

        case 'services': {
          service.services = getLinkedServicesObject(member, reflection, errorList);
          break;
        }
      }
    }

    if (!isCompleteService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    if (allServices[declaration.name]) {
      errorList.push(new DuplicateServiceError(declaration.name, fileName));
      continue;
    }

    allServices[declaration.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isCompleteService = (type: Incomplete<FactoryService>): type is FactoryService => {
  return isObjectWith(type, ['handler', 'variables', 'services']);
};
