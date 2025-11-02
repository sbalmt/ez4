import type { SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { HttpImport } from '../types/import';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  getModelMembers,
  getPropertyString,
  getReferenceName
} from '@ez4/common/library';

import { isModelProperty, isTypeReference } from '@ez4/reflection';

import { ImportType } from '../types/import';
import { IncompleteServiceError } from '../errors/service';
import { isHttpImport } from './utils';
import { getHttpDefaults } from './defaults';
import { getHttpRoutes } from './route';

export const getHttpImports = (reflection: SourceMap) => {
  const allImports: Record<string, HttpImport> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isHttpImport(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<HttpImport> = { type: ImportType };
    const properties = new Set(['reference', 'project', 'routes']);

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

        case 'routes':
          if (member.inherited && (service.routes = getHttpRoutes(declaration, member, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'default':
          if (member.inherited) {
            service.defaults = getHttpDefaults(member.value, declaration, reflection, errorList);
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

const isValidImport = (type: Incomplete<HttpImport>): type is HttpImport => {
  return !!type.name && !!type.reference && !!type.project && !!type.routes;
};
