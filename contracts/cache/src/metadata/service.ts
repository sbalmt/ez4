import type { AllType, ReflectionTypes, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { CacheService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../errors/service';
import { getCacheEngineMetadata } from './engine';
import { createCacheService } from './types';

export const isCacheServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Cache.Service');
};

export const getCacheServicesMetadata = (reflection: ReflectionTypes) => {
  const allServices: Record<string, CacheService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isCacheServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createCacheService(declaration.name);
    const properties = new Set(['engine']);

    const fileName = declaration.file;

    if (declaration.description) {
      service.description = declaration.description;
    }

    for (const member of getModelMembers(declaration)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        default: {
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;
        }

        case 'client':
          break;

        case 'engine': {
          if ((service.engine = getCacheEngineMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'variables': {
          service.variables = getLinkedVariableList(member, errorList);
          break;
        }

        case 'services': {
          service.services = getLinkedServiceList(member, reflection, errorList);
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

const isCompleteService = (type: Incomplete<CacheService>): type is CacheService => {
  return isObjectWith(type, ['engine', 'variables', 'services']);
};
