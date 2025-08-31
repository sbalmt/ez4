import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { TopicImport } from '../types/import.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  getReferenceName,
  getReferenceModel
} from '@ez4/common/library';

import { isModelProperty, isTypeReference, isTypeUnion } from '@ez4/reflection';

import { ImportType } from '../types/import.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllSubscription } from './subscription.js';
import { getTopicMessage } from './message.js';
import { getTopicFifoMode } from './fifo.js';
import { isTopicImport } from './utils.js';

export const getTopicImports = (reflection: SourceMap) => {
  const allImports: Record<string, TopicImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isTopicImport(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<TopicImport> = { type: ImportType };
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
            service[member.name] = getReferenceName(member.value);
            properties.delete(member.name);
          }
          break;

        case 'project':
          if (!member.inherited && (service.project = getPropertyString(member))) {
            properties.delete(member.name);
          }
          break;

        case 'schema':
          if (member.inherited && (service.schema = getTopicMessage(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'fifoMode':
          if (member.inherited) {
            const reference = getReferenceModel(member.value, reflection);

            if (reference && !isTypeUnion(reference)) {
              service.fifoMode = getTopicFifoMode(reference, declaration, reflection, errorList);
            }
          }
          break;

        case 'subscriptions': {
          if (!member.inherited) {
            service.subscriptions = getAllSubscription(member, declaration, reflection, errorList);
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
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    if (allImports[declaration.name]) {
      errorList.push(new DuplicateServiceError(declaration.name, fileName));
      continue;
    }

    allImports[declaration.name] = service;
  }

  return {
    services: allImports,
    errors: errorList
  };
};

const isValidImport = (type: Incomplete<TopicImport>): type is TopicImport => {
  return !!type.name && !!type.reference && !!type.project && !!type.schema && !!type.subscriptions;
};
