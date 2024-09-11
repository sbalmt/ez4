import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { CronService } from '../types/service.js';

import {
  getLinkedServices,
  getLinkedVariables,
  getModelMembers,
  getPropertyNumber
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getCronHandler } from './handler.js';
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
    const properties = new Set(['handler']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        case 'handler': {
          if ((service.handler = getCronHandler(member.value, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'timeout':
        case 'memory': {
          const value = getPropertyNumber(member);
          if (value !== undefined && value !== null) {
            service[member.name] = value;
          }
          break;
        }

        case 'variables':
          service.variables = getLinkedVariables(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServices(member, reflection, errorList);
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
  return !!type.name && !!type.handler;
};
