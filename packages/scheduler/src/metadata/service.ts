import type { SourceMap, TypeModel } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { CronService } from '../types/service.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getModelMembers
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType, DynamicExpression } from '../types/service.js';
import { IncompleteServiceError, IncorrectServiceError } from '../errors/service.js';
import { IncorrectHandlerError } from '../errors/handler.js';
import { getCronTarget } from './target.js';
import { isCronService } from './utils.js';
import { getCronEvent } from './event.js';

export const getCronServices = (reflection: SourceMap) => {
  const cronServices: Record<string, CronService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isCronService(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<CronService> = { type: ServiceType };
    const properties = new Set(['target', 'expression']);

    const fileName = statement.file;

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'schema':
          if ((service.schema = getCronEvent(member.value, statement, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'target':
          if (!member.inherited && (service.target = getCronTarget(member.value, statement, reflection, errorList))) {
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

    const validationErrors = validateDynamicProperties(statement, service);

    if (validationErrors.length) {
      errorList.push(...validationErrors);
      continue;
    }

    if (cronServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, fileName));
      continue;
    }

    cronServices[statement.name] = service;
  }

  return {
    services: cronServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<CronService>): type is CronService => {
  if (!type.name || !type.target) {
    return false;
  }

  if (!type.schema) {
    return type.expression !== DynamicExpression && !!type.expression;
  }

  return type.expression === DynamicExpression;
};

const validateDynamicProperties = (parent: TypeModel, service: CronService) => {
  const errorList = [];

  if (!service.schema) {
    if (service.target.handler.input) {
      errorList.push(new IncorrectHandlerError([service.target.handler.input], parent.file));
    }
  } else {
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
