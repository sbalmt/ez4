import type { ServiceMetadata } from '@ez4/project/library';
import type { VirtualState } from './types';

import { hashData } from '@ez4/utils';

import { ServiceType } from '../metadata/types';

export const createVirtualState = (service: ServiceMetadata): VirtualState => {
  return {
    entryId: hashData(ServiceType, service.name),
    type: ServiceType,
    dependencies: [],
    parameters: {
      services: service.services
    }
  };
};
