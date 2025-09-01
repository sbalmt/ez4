import type { ModelProperty, SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { CdnService } from '../types/service';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  getModelMembers,
  getPropertyBoolean,
  getPropertyString,
  getPropertyTuple
} from '@ez4/common/library';

import { isModelProperty, isTypeString } from '@ez4/reflection';

import { ServiceType } from '../types/service';
import { IncompleteServiceError } from '../errors/service';
import { getAllCdnOrigins, getCdnOrigin } from './origin';
import { getCdnCertificate } from './certificate';
import { getAllFallbacks } from './fallback';
import { isCdnService } from './utils';

export const getCdnServices = (reflection: SourceMap) => {
  const allServices: Record<string, CdnService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isCdnService(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service: Incomplete<CdnService> = { type: ServiceType, extras: {} };
    const properties = new Set(['defaultOrigin']);

    const fileName = declaration.file;

    service.name = declaration.name;

    if (declaration.description) {
      service.description = declaration.description;
    }

    for (const member of getModelMembers(declaration)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'defaultOrigin':
          if ((service.defaultOrigin = getCdnOrigin(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;

        case 'defaultIndex':
          service.defaultIndex = getPropertyString(member);
          break;

        case 'aliases':
          service.aliases = getAllAliases(member);
          break;

        case 'certificate':
          service.certificate = getCdnCertificate(member.value, declaration, reflection, errorList);
          break;

        case 'origins':
          service.origins = getAllCdnOrigins(member.value, declaration, reflection, errorList);
          break;

        case 'fallbacks':
          service.fallbacks = getAllFallbacks(member, declaration, reflection, errorList);
          break;

        case 'disabled':
          service.disabled = getPropertyBoolean(member);
          break;
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], fileName));
      continue;
    }

    if (allServices[declaration.name]) {
      errorList.push(new DuplicateServiceError(declaration.name, fileName));
      continue;
    }

    allServices[declaration.name] = service;
  }

  return {
    services: allServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<CdnService>): type is CdnService => {
  return !!type.name && !!type.defaultOrigin && !!type.extras;
};

const getAllAliases = (member: ModelProperty) => {
  const aliasItems = getPropertyTuple(member) ?? [];
  const aliasList: string[] = [];

  for (const alias of aliasItems) {
    if (!isTypeString(alias) || !alias.literal) {
      continue;
    }

    aliasList.push(alias.literal);
  }

  return aliasList;
};
