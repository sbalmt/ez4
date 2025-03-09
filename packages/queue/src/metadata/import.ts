import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { QueueImport } from '../types/import.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalStatement,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  getReferenceName,
  getReferenceNumber,
  getReferenceModel
} from '@ez4/common/library';

import { isModelProperty, isTypeReference, isTypeUnion } from '@ez4/reflection';

import { ImportType } from '../types/import.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllSubscription } from './subscription.js';
import { getQueueMessage } from './message.js';
import { getQueueFifoMode } from './fifo.js';
import { isQueueImport } from './utils.js';

export const getQueueImports = (reflection: SourceMap) => {
  const queueImports: Record<string, QueueImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isQueueImport(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<QueueImport> = { type: ImportType };
    const properties = new Set(['project', 'reference', 'schema']);

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
          if (!member.inherited) {
            errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          }
          break;

        case 'reference':
          if (member.inherited && isTypeReference(member.value)) {
            service.reference = getReferenceName(member.value);
            properties.delete(member.name);
          }
          break;

        case 'project':
          if (!member.inherited && (service.project = getPropertyString(member))) {
            properties.delete(member.name);
          }
          break;

        case 'schema':
          if (member.inherited && (service.schema = getQueueMessage(member.value, statement, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'fifoMode':
          if (member.inherited) {
            const reference = getReferenceModel(member.value, reflection);

            if (reference && !isTypeUnion(reference)) {
              service.fifoMode = getQueueFifoMode(reference, statement, reflection, errorList);
            }
          }
          break;

        case 'subscriptions':
          if (!member.inherited) {
            service.subscriptions = getAllSubscription(member, statement, reflection, errorList);
          } else {
            service.subscriptions = [];
          }
          break;

        case 'timeout':
          if (member.inherited) {
            service.timeout = getReferenceNumber(member.value, reflection);
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

    if (!isValidImport(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    if (queueImports[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, fileName));
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
  return !!type.name && !!type.reference && !!type.project && !!type.schema && !!type.subscriptions;
};
