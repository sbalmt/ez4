import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { CdnService } from '../types/service.js';

import { getPropertyBoolean, getModelMembers, getPropertyString } from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { getCdnOrigin } from './origin.js';
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
        case 'defaultOrigin': {
          const defaultOrigin = getCdnOrigin(member.value, statement, reflection, errorList);
          if (defaultOrigin) {
            service.defaultOrigin = defaultOrigin;
            properties.delete(member.name);
          }
          break;
        }

        case 'defaultIndex': {
          const value = getPropertyString(member);
          if (value !== undefined && value !== null) {
            service[member.name] = value;
          }
          break;
        }

        case 'compress':
        case 'disabled': {
          const value = getPropertyBoolean(member);
          if (value !== undefined && value !== null) {
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
