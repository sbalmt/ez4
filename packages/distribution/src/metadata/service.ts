import type { ModelProperty, SourceMap } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { CdnService } from '../types/service.js';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalStatement,
  getModelMembers,
  getPropertyBoolean,
  getPropertyString,
  getPropertyTuple
} from '@ez4/common/library';

import { isModelProperty, isTypeString } from '@ez4/reflection';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllCdnOrigins, getCdnOrigin } from './origin.js';
import { getCdnCertificate } from './certificate.js';
import { getAllFallbacks } from './fallback.js';
import { isCdnService } from './utils.js';

export const getCdnServices = (reflection: SourceMap) => {
  const cdnServices: Record<string, CdnService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isCdnService(statement) || isExternalStatement(statement)) {
      continue;
    }

    const service: Incomplete<CdnService> = { type: ServiceType };
    const properties = new Set(['defaultOrigin']);

    const fileName = statement.file;

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default:
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;

        case 'defaultOrigin':
          if ((service.defaultOrigin = getCdnOrigin(member.value, statement, reflection, errorList))) {
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
          service.certificate = getCdnCertificate(member.value, statement, reflection, errorList);
          break;

        case 'origins':
          service.origins = getAllCdnOrigins(member.value, statement, reflection, errorList);
          break;

        case 'fallbacks':
          service.fallbacks = getAllFallbacks(member, statement, reflection, errorList);
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

    if (cdnServices[statement.name]) {
      errorList.push(new DuplicateServiceError(statement.name, fileName));
      continue;
    }

    cdnServices[statement.name] = service;
  }

  return {
    services: cdnServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<CdnService>): type is CdnService => {
  return !!type.name && !!type.defaultOrigin;
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
