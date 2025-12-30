import type { AllType, ReflectionTypes, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpImport } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getModelMembers,
  getPropertyString,
  getReferenceName,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty, isTypeReference } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../../errors/service';
import { getFullTypeName } from '../utils/name';
import { createHttpImport, HttpNamespaceType } from './types';
import { getHttpAuthorizationMetadata } from './authorization';
import { getHttpDefaultsMetadata } from './defaults';
import { getHttpRemoteRoutes } from './routes';

export const isHttpImportDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, getFullTypeName(HttpNamespaceType, 'Import'));
};

export const getHttpImportsMetadata = (reflection: ReflectionTypes) => {
  const allImports: Record<string, HttpImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isHttpImportDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createHttpImport(declaration.name);
    const properties = new Set(['project', 'reference', 'routes']);

    const fileName = declaration.file;

    if (declaration.description) {
      service.description = declaration.description;
    }

    for (const member of getModelMembers(declaration, true)) {
      if (!isModelProperty(member)) {
        continue;
      }

      switch (member.name) {
        default: {
          if (!member.inherited) {
            errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          }
          break;
        }

        case 'reference': {
          if (member.inherited && isTypeReference(member.value)) {
            service[member.name] = getReferenceName(member.value);
            properties.delete(member.name);
          }
          break;
        }

        case 'authorization': {
          if (!member.inherited) {
            service[member.name] = getHttpAuthorizationMetadata(member.value, declaration, reflection, errorList);
          }
          break;
        }

        case 'project': {
          if (!member.inherited && (service.project = getPropertyString(member))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'name': {
          if (member.inherited) {
            service.displayName = getPropertyString(member, reflection);
          }
          break;
        }

        case 'routes': {
          if (member.inherited && (service.routes = getHttpRemoteRoutes(declaration, member, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'defaults': {
          if (member.inherited) {
            service.defaults = getHttpDefaultsMetadata(member.value, declaration, reflection, errorList);
          }
          break;
        }
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

const isCompleteService = (type: Incomplete<HttpImport>): type is HttpImport => {
  return isObjectWith(type, ['project', 'reference', 'routes']);
};
