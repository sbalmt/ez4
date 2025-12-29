import type { AllType, ReflectionTypes, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { QueueImport } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getLinkedServiceList,
  getLinkedVariableList,
  getModelMembers,
  getPropertyString,
  getReferenceName,
  getReferenceModel,
  getPropertyNumber,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeReference, isTypeUnion } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../errors/service';
import { getQueueSubscriptionsMetadata } from './subscription';
import { getQueueMessageMetadata } from './message';
import { getQueueFifoModeMetadata } from './fifo';
import { createQueueImport } from './types';

export const isQueueImportDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Queue.Import');
};

export const getQueueImportsMetadata = (reflection: ReflectionTypes) => {
  const queueImports: Record<string, QueueImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isQueueImportDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createQueueImport(declaration.name);
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

        case 'reference': {
          if (member.inherited && isTypeReference(member.value)) {
            service.reference = getReferenceName(member.value);
            properties.delete(member.name);
          }
          break;
        }

        case 'project': {
          if (!member.inherited && (service.project = getPropertyString(member))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'schema': {
          if (member.inherited && (service.schema = getQueueMessageMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'fifoMode': {
          if (member.inherited) {
            const reference = getReferenceModel(member.value, reflection);

            if (reference && !isTypeUnion(reference)) {
              service.fifoMode = getQueueFifoModeMetadata(reference, declaration, reflection, errorList);
            }
          }
          break;
        }

        case 'subscriptions': {
          if (!member.inherited) {
            service.subscriptions = getQueueSubscriptionsMetadata(member, declaration, reflection, errorList);
          } else {
            service.subscriptions = [];
          }
          break;
        }

        case 'timeout': {
          if (member.inherited) {
            service.timeout = getPropertyNumber(member, reflection);
          }
          break;
        }

        case 'variables': {
          if (!member.inherited) {
            service.variables = getLinkedVariableList(member, errorList);
          }
          break;
        }

        case 'services': {
          if (!member.inherited) {
            service.services = getLinkedServiceList(member, reflection, errorList);
          }
          break;
        }
      }
    }

    if (!isCompleteService(service)) {
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

const isCompleteService = (type: Incomplete<QueueImport>): type is QueueImport => {
  return isObjectWith(type, ['project', 'reference', 'schema', 'subscriptions', 'variables', 'services']);
};
