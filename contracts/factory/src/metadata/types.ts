import type { FunctionSignature } from '@ez4/common/library';
import type { ServiceMetadata } from '@ez4/project/library';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/factory';

export type FactoryService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    name: string;
    description?: string;
    handler: FactoryHandler;
  };

export type FactoryHandler = FunctionSignature;

export const isFactoryService = (service: ServiceMetadata): service is FactoryService => {
  return service.type === ServiceType;
};

export const createFactoryService = (name: string) => {
  return {
    ...createServiceMetadata<FactoryService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
