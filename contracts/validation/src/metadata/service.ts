import type { AllType, SourceMap, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { ValidationService } from './types';

import {
  DuplicateServiceError,
  isExternalDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  InvalidServicePropertyError,
  isClassDeclaration,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { getAnySchema } from '@ez4/schema/library';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../errors/service';
import { getValidationHandlerMetadata } from './handler';
import { createValidationService } from './types';

export const isValidationServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Validation.Service');
};

export const getValidationServicesMetadata = (reflection: SourceMap) => {
  const allServices: Record<string, ValidationService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isValidationServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createValidationService(declaration.name);
    const properties = new Set(['handler', 'schema']);

    const fileName = declaration.file;

    if (declaration.description) {
      service.description = declaration.description;
    }

    for (const member of getModelMembers(declaration, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'client':
          break;

        case 'handler':
          if (!member.inherited && (service.handler = getValidationHandlerMetadata(member.value, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'schema':
          if ((service.schema = getAnySchema(member.value, reflection))) {
            properties.delete(member.name);
          }
          break;

        case 'variables':
          if (!member.inherited) {
            service.variables = getLinkedVariableList(member, errorList);
          }
          break;

        case 'services':
          if (!member.inherited) {
            service.services = getLinkedServiceList(member, reflection, errorList);
          }
          break;
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

const isCompleteService = (type: Incomplete<ValidationService>): type is ValidationService => {
  return isObjectWith(type, ['handler', 'schema', 'variables', 'services']);
};
