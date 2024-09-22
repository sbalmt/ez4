import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { QueueImport } from '../types/import.js';

import {
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ImportType } from '../types/import.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllSubscription } from './subscription.js';
import { isQueueImport } from './utils.js';

export const getQueueImports = (reflection: SourceMap) => {
  const queueImports: Record<string, QueueImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isQueueImport(statement)) {
      continue;
    }

    const service: Incomplete<QueueImport> = { type: ImportType };
    const properties = new Set(['subscriptions', 'project']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        case 'project': {
          const value = getPropertyString(member);
          if (value !== undefined && value !== null) {
            service[member.name] = value;
          }
          break;
        }

        case 'subscriptions': {
          service.subscriptions = getAllSubscription(member, statement, reflection, errorList);
          if (service.subscriptions) {
            properties.delete(member.name);
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

    if (!isValidImport(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    queueImports[statement.name] = service;
  }

  return {
    services: queueImports,
    errors: errorList
  };
};

const isValidImport = (type: Incomplete<QueueImport>): type is QueueImport => {
  return !!type.name && !!type.project && !!type.subscriptions;
};
