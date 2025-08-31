import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { QueueImport } from '../types/import.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
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
    const declaration = reflection[identity];

    if (!isQueueImport(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<QueueImport> = { type: ImportType };
    const properties = new Set(['project', 'reference', 'schema']);

    const fileName = declaration.file;

    service.name = declaration.name;

    if (declaration.description) {
      service.description = declaration.description;
    }

    for (const member of getModelMembers(declaration, true)) {
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
          if (member.inherited && (service.schema = getQueueMessage(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'fifoMode':
          if (member.inherited) {
            const reference = getReferenceModel(member.value, reflection);

            if (reference && !isTypeUnion(reference)) {
              service.fifoMode = getQueueFifoMode(reference, declaration, reflection, errorList);
            }
          }
          break;

        case 'subscriptions':
          if (!member.inherited) {
            service.subscriptions = getAllSubscription(member, declaration, reflection, errorList);
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

    if (queueImports[declaration.name]) {
      errorList.push(new DuplicateServiceError(declaration.name, fileName));
      continue;
    }

    queueImports[declaration.name] = service;
  }

  return {
    services: queueImports,
    errors: errorList
  };
};

const isValidImport = (type: Incomplete<QueueImport>): type is QueueImport => {
  return !!type.name && !!type.reference && !!type.project && !!type.schema && !!type.subscriptions;
};
