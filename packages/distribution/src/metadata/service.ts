import type { Incomplete } from '@ez4/utils';
import type { ModelProperty, SourceMap } from '@ez4/reflection';
import type { CdnService } from '../types/service.js';

import {
  getModelMembers,
  getPropertyBoolean,
  getPropertyString,
  getPropertyTuple
} from '@ez4/common/library';

import { isModelProperty, isTypeString } from '@ez4/reflection';
import { isAnyBoolean } from '@ez4/utils';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getAllCdnOrigins, getCdnOrigin } from './origin.js';
import { getAllFallbacks } from './fallback.js';
import { isCdnService } from './utils.js';

export const getCdnServices = (reflection: SourceMap) => {
  const cdnServices: Record<string, CdnService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isCdnService(statement)) {
      continue;
    }

    const service: Incomplete<CdnService> = { type: ServiceType };
    const properties = new Set(['defaultOrigin']);

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    for (const member of getModelMembers(statement)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        case 'aliases':
          service.aliases = getAllAliases(member);
          break;

        case 'defaultIndex': {
          const value = getPropertyString(member);
          if (value) {
            service[member.name] = value;
          }
          break;
        }

        case 'defaultOrigin': {
          const defaultOrigin = getCdnOrigin(member.value, statement, reflection, errorList);
          if (defaultOrigin) {
            service.defaultOrigin = defaultOrigin;
            properties.delete(member.name);
          }
          break;
        }

        case 'origins': {
          const originList = getAllCdnOrigins(member.value, statement, reflection, errorList);
          if (originList?.length) {
            service.origins = originList;
          }
          break;
        }

        case 'fallbacks': {
          const fallbackList = getAllFallbacks(member, statement, reflection, errorList);
          if (fallbackList) {
            service.fallbacks = fallbackList;
          }
          break;
        }

        case 'disabled': {
          const value = getPropertyBoolean(member);
          if (isAnyBoolean(value)) {
            service[member.name] = value;
          }
          break;
        }
      }
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([...properties], statement.file));
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
