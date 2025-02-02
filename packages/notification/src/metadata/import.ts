import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { NotificationImport } from '../types/import.js';

import {
  DuplicateServiceError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  getReferenceName
} from '@ez4/common/library';

import { isModelProperty, isTypeReference } from '@ez4/reflection';

import { ImportType } from '../types/import.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllSubscription } from './subscription.js';
import { getNotificationMessage } from './message.js';
import { isNotificationImport } from './utils.js';

export const getNotificationImports = (reflection: SourceMap) => {
  const allImports: Record<string, NotificationImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isNotificationImport(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<NotificationImport> = { type: ImportType };
    const properties = new Set(['project', 'reference', 'schema']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        case 'reference': {
          if (member.inherited && isTypeReference(member.value)) {
            service[member.name] = getReferenceName(member.value);
            properties.delete(member.name);
          }
          break;
        }

        case 'project': {
          if (!member.inherited) {
            service.project = getPropertyString(member);
            if (service.project) {
              properties.delete(member.name);
            }
          }
          break;
        }

        case 'schema': {
          if (member.inherited) {
            service.schema = getNotificationMessage(member.value, statement, reflection, errorList);
            if (service.schema) {
              properties.delete(member.name);
            }
          }
          break;
        }

        case 'subscriptions': {
          if (!member.inherited) {
            service.subscriptions = getAllSubscription(member, statement, reflection, errorList);
          } else {
            service.subscriptions = [];
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

    if (!isValidImport(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
      continue;
    }

    if (allImports[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, statement.file));
      continue;
    }

    allImports[statement.name] = service;
  }

  return {
    services: allImports,
    errors: errorList
  };
};

const isValidImport = (type: Incomplete<NotificationImport>): type is NotificationImport => {
  return !!type.name && !!type.reference && !!type.project && !!type.schema && !!type.subscriptions;
};
