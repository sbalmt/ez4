import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { BucketService } from '../types/service';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  getLinkedVariableList,
  getLinkedServiceList,
  getModelMembers,
  getPropertyNumber,
  getPropertyString
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { createBucketService } from '../types/service';
import { IncompleteServiceError } from '../errors/service';
import { isBucketService } from './utils';
import { getBucketEvent } from './event';
import { getBucketCors } from './cors';

export const getBucketServices = (reflection: SourceMap) => {
  const allServices: Record<string, BucketService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isBucketService(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createBucketService(declaration.name);

    const fileName = declaration.file;

    for (const member of getModelMembers(declaration)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'client':
          break;

        case 'localPath':
        case 'globalName':
          service[member.name] = getPropertyString(member);
          break;

        case 'autoExpireDays':
          service.autoExpireDays = getPropertyNumber(member);
          break;

        case 'events':
          service.events = getBucketEvent(member.value, declaration, reflection, errorList);
          break;

        case 'cors':
          service.cors = getBucketCors(member.value, declaration, reflection, errorList);
          break;

        case 'variables':
          service.variables = getLinkedVariableList(member, errorList);
          break;

        case 'services':
          service.services = getLinkedServiceList(member, reflection, errorList);
          break;
      }
    }

    if (!isCompleteService(service)) {
      errorList.push(new IncompleteServiceError([], fileName));
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

const isCompleteService = (type: Incomplete<BucketService>): type is BucketService => {
  return isObjectWith(type, ['variables', 'services']);
};
