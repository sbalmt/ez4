import type { EmulatorService, MetadataServiceResult, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { SourceMap } from '@ez4/reflection';

import { ServiceName, ServiceType } from '../types/services';
import { prepareLinkedClient } from './client';
import { isCommonService } from './utils';

export const prepareLinkedServices = (event: ServiceEvent) => {
  return isCommonService(event.service) ? prepareLinkedClient() : null;
};

export const prepareCommonServices = (event: PrepareResourceEvent) => {
  return isCommonService(event.service);
};

export const getCommonServices = (_reflection: SourceMap): MetadataServiceResult => {
  return {
    errors: [],
    services: {
      [ServiceName]: {
        type: ServiceType,
        name: ServiceName,
        extras: {}
      }
    }
  };
};

export const getCommonEmulators = (): EmulatorService => {
  return {
    identifier: ServiceName,
    name: ServiceName,
    type: ServiceType
  };
};
