import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { CronService } from '../types/service.js';

import {
  DuplicateServiceError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getModelMembers
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isAnyBoolean, isAnyNumber } from '@ez4/utils';

import { ServiceType, DynamicExpression } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { InvalidHandlerError } from '../errors/handler.js';
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

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        case 'schema': {
          const value = getCronEvent(member.value, statement, reflection, errorList);

          if (value) {
            properties.delete(member.name);
            service.schema = value;
          }

          break;
        }

        case 'target': {
          if (!member.inherited) {
            const value = getCronTarget(member.value, statement, reflection, errorList);

            if (value) {
              properties.delete(member.name);
              service.target = value;
            }
          }

          break;
        }

        case 'group':
        case 'timezone':
        case 'startDate':
        case 'endDate': {
          if (!member.inherited) {
            const value = getPropertyString(member);

            if (value) {
              service[member.name] = value;
            }
          }

          break;
        }

        case 'expression': {
          if (!member.inherited) {
            const value = getPropertyString(member);

            if (value) {
              properties.delete(member.name);
              service.expression = value;

              if (value === DynamicExpression && !service.schema) {
                properties.add('schema');
              }
            }
          }

          break;
        }

        case 'disabled': {
          if (!member.inherited) {
            const value = getPropertyBoolean(member);

            if (isAnyBoolean(value)) {
              service.disabled = value;
            }
          }

          break;
        }

        case 'maxRetries':
        case 'maxAge': {
          if (!member.inherited) {
            const value = getPropertyNumber(member);

            if (isAnyNumber(value)) {
              service[member.name] = value;
            }
          }

          break;
        }

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
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    if (!service.schema && service.target.handler.request) {
      errorList.push(new InvalidHandlerError(statement.file));
      continue;
    }

    if (cronServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, statement.file));
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
