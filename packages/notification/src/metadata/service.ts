import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { NotificationService } from '../types/service.js';

import {
  DuplicateServiceError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  InvalidServicePropertyError
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllSubscription } from './subscription.js';
import { getNotificationMessage } from './message.js';
import { isNotificationService } from './utils.js';

export const getNotificationServices = (reflection: SourceMap) => {
  const allServices: Record<string, NotificationService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isNotificationService(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<NotificationService> = { type: ServiceType };
    const properties = new Set(['subscriptions', 'schema']);

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
          service.schema = getNotificationMessage(member.value, statement, reflection, errorList);
          if (service.schema) {
            properties.delete(member.name);
          }
          break;
        }

        case 'subscriptions': {
          if (!member.inherited) {
            service.subscriptions = getAllSubscription(member, statement, reflection, errorList);
            if (service.subscriptions) {
              properties.delete(member.name);
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

        default:
          if (!member.inherited) {
            errorList.push(
              new InvalidServicePropertyError(statement.name, member.name, statement.file)
            );
          }
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    if (allServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, statement.file));
      continue;
    }

    allServices[statement.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<NotificationService>): type is NotificationService => {
  return !!type.name && !!type.schema && !!type.subscriptions;
};
