import type { SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { CronService } from '../types/service.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getModelMembers
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType, DynamicExpression, isDynamicCronService } from '../types/service.js';
import { IncompleteServiceError, IncorrectServiceError } from '../errors/service.js';
import { getCronTarget } from './target.js';
import { isCronService } from './utils.js';
import { getCronEvent } from './event.js';

export const getCronServices = (reflection: SourceMap) => {
  const allServices: Record<string, CronService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isCronService(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<CronService> = { type: ServiceType, extras: {} };
    const properties = new Set(['target', 'expression']);

    const fileName = declaration.file;

    service.name = declaration.name;

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

        case 'schema':
          if ((service.schema = getCronEvent(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'target':
          if (!member.inherited && (service.target = getCronTarget(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'expression': {
          if (!member.inherited && (service.expression = getPropertyString(member))) {
            properties.delete(member.name);

            if (service.expression === DynamicExpression && !service.schema) {
              properties.add('schema');
            }
          }

          break;
        }

        case 'group':
        case 'timezone':
        case 'startDate':
        case 'endDate':
          if (!member.inherited) {
            service[member.name] = getPropertyString(member);
          }
          break;

        case 'disabled':
          if (!member.inherited) {
            service.disabled = getPropertyBoolean(member);
          }
          break;

        case 'maxAge':
        case 'maxRetries':
          if (!member.inherited) {
            service[member.name] = getPropertyNumber(member);
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

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    const validationErrors = validateDynamicProperties(declaration, service);

    if (validationErrors.length) {
      errorList.push(...validationErrors);
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

const isValidService = (type: Incomplete<CronService>): type is CronService => {
  if (!type.name || !type.target || !type.extras) {
    return false;
  }

  if (!type.schema) {
    return type.expression !== DynamicExpression && !!type.expression;
  }

  return type.expression === DynamicExpression;
};

const validateDynamicProperties = (parent: TypeModel, service: CronService) => {
  const errorList = [];

  if (isDynamicCronService(service)) {
    const allProperties: (keyof CronService)[] = ['disabled', 'timezone', 'startDate', 'endDate'];
    const allIncorrect = [];

    for (const property of allProperties) {
      if (service[property]) {
        allIncorrect.push(property);
      }
    }

    if (allIncorrect.length) {
      errorList.push(new IncorrectServiceError(allIncorrect, parent.file));
    }
  }

  return errorList;
};
