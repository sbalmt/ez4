import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { BucketService } from '../types/service.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalStatement,
  getLinkedVariableList,
  getLinkedServiceList,
  getModelMembers,
  getPropertyNumber,
  getPropertyString
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { isBucketService } from './utils.js';
import { getBucketEvent } from './event.js';
import { getBucketCors } from './cors.js';

export const getBucketServices = (reflection: SourceMap) => {
  const allServices: Record<string, BucketService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isBucketService(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<BucketService> = { type: ServiceType };

    const fileName = statement.file;

    service.name = statement.name;

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'localPath':
        case 'globalName':
          service[member.name] = getPropertyString(member);
          break;

        case 'autoExpireDays':
          service.autoExpireDays = getPropertyNumber(member);
          break;

        case 'events':
          service.events = getBucketEvent(member.value, statement, reflection, errorList);
          break;

        case 'cors':
          service.cors = getBucketCors(member.value, statement, reflection, errorList);
          break;

        case 'variables':
          service.variables = getLinkedVariableList(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServiceList(member, reflection, errorList);
          break;
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([], fileName));
      continue;
    }

    if (allServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, fileName));
      continue;
    }

    allServices[statement.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<BucketService>): type is BucketService => {
  return !!type.name;
};
