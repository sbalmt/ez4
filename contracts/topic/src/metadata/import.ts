import type { ReflectionTypes } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { TopicImport } from '../types/import';

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
import { isObjectWith } from '@ez4/utils';

import { createTopicImport } from '../types/import';
import { IncompleteServiceError } from '../errors/service';
import { getAllSubscription } from './subscription';
import { getTopicMessage } from './message';
import { getTopicFifoMode } from './fifo';
import { isTopicImport } from './utils';

export const getTopicImports = (reflection: ReflectionTypes) => {
  const allImports: Record<string, TopicImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isTopicImport(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createTopicImport(declaration.name);
    const properties = new Set(['project', 'reference', 'schema']);

    const fileName = declaration.file;

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

    if (!isCompleteService(service)) {
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

const isCompleteService = (type: Incomplete<TopicImport>): type is TopicImport => {
  return isObjectWith(type, ['project', 'reference', 'schema', 'subscriptions', 'variables', 'services']);
};
