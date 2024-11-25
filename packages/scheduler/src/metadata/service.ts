import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { CronService } from '../types/service.js';

import {
  getLinkedServiceList,
  getLinkedVariableList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString,
  getModelMembers
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isAnyBoolean, isAnyNumber } from '@ez4/utils';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getCronTarget } from './target.js';
import { isCronService } from './utils.js';

export const getCronServices = (reflection: SourceMap) => {
  const cronServices: Record<string, CronService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isCronService(statement)) {
      continue;
    }

    const service: Incomplete<CronService> = { type: ServiceType };
    const properties = new Set(['target', 'expression']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        case 'target': {
          if ((service.target = getCronTarget(member.value, statement, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'expression':
        case 'timezone':
        case 'startDate':
        case 'endDate': {
          const value = getPropertyString(member);
          if (value !== undefined && value !== null) {
            properties.delete(member.name);
            service[member.name] = value;
          }
          break;
        }

        case 'disabled': {
          const value = getPropertyBoolean(member);
          if (isAnyBoolean(value)) {
            service[member.name] = value;
          }
          break;
        }

        case 'maxRetryAttempts':
        case 'maxEventAge': {
          const value = getPropertyNumber(member);
          if (isAnyNumber(value)) {
            service[member.name] = value;
          }
          break;
        }

        case 'variables':
          service.variables = getLinkedVariableList(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServiceList(member, reflection, errorList);
          break;
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
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
  return !!type.name && !!type.target && !!type.expression;
};
