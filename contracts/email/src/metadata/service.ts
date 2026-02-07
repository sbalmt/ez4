import type { AllType, ReflectionTypes, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { EmailService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { createEmailService } from './types';
import { IncompleteServiceError } from '../errors/service';

export const isEmailServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Email.Service');
};

export const getEmailServicesMetadata = (reflection: ReflectionTypes) => {
  const allServices: Record<string, EmailService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isEmailServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createEmailService(declaration.name);
    const properties = new Set(['domain']);

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

        case 'domain': {
          if ((service.domain = getPropertyString(member))) {
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

const isCompleteService = (type: Incomplete<EmailService>): type is EmailService => {
  return isObjectWith(type, ['domain', 'variables', 'services']);
};
