import type { AllType, ReflectionTypes, TypeClass } from '@ez4/reflection';
import type { Incomplete } from '@ez4/utils';
import type { CdnService } from './types';

import {
  DuplicateServiceError,
  InvalidServicePropertyError,
  isExternalDeclaration,
  isClassDeclaration,
  getModelMembers,
  getPropertyBoolean,
  getPropertyStringList,
  getPropertyString,
  hasHeritageType
} from '@ez4/common/library';

import { isModelProperty } from '@ez4/reflection';
import { isObjectWith } from '@ez4/utils';

import { IncompleteServiceError } from '../errors/service';
import { getCdnOriginsMetadata, getCdnOriginMetadata } from './origin';
import { getCdnCertificateMetadata } from './certificate';
import { getCndFallbacksMetadata } from './fallback';
import { createCdnService } from './types';

export const isCdnServiceDeclaration = (type: AllType): type is TypeClass => {
  return isClassDeclaration(type) && hasHeritageType(type, 'Cdn.Service');
};

export const getCdnServicesMetadata = (reflection: ReflectionTypes) => {
  const allServices: Record<string, CdnService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const declaration = reflection[identity];

    if (!isCdnServiceDeclaration(declaration) || isExternalDeclaration(declaration)) {
      continue;
    }

    const service = createCdnService(declaration.name);
    const properties = new Set(['defaultOrigin']);

    const fileName = declaration.file;

    if (declaration.description) {
      service.description = declaration.description;
    }

    for (const member of getModelMembers(declaration)) {
      if (!isModelProperty(member) || member.inherited) {
        continue;
      }

      switch (member.name) {
        default: {
          errorList.push(new InvalidServicePropertyError(service.name, member.name, fileName));
          break;
        }

        case 'defaultOrigin': {
          if ((service.defaultOrigin = getCdnOriginMetadata(member.value, declaration, reflection, errorList))) {
            properties.delete(member.name);
          }
          break;
        }

        case 'defaultIndex': {
          service.defaultIndex = getPropertyString(member);
          break;
        }

        case 'aliases': {
          service.aliases = getPropertyStringList(member);
          break;
        }

        case 'certificate': {
          service.certificate = getCdnCertificateMetadata(member.value, declaration, reflection, errorList);
          break;
        }

        case 'origins': {
          service.origins = getCdnOriginsMetadata(member.value, declaration, reflection, errorList);
          break;
        }

        case 'fallbacks': {
          service.fallbacks = getCndFallbacksMetadata(member, declaration, reflection, errorList);
          break;
        }

        case 'disabled': {
          service.disabled = getPropertyBoolean(member);
          break;
        }
      }
    }

    if (!isCompleteService(service)) {
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

const isCompleteService = (type: Incomplete<CdnService>): type is CdnService => {
  return isObjectWith(type, ['defaultOrigin']);
};
