import type { FunctionSignature } from '@ez4/common/library';
import type { ServiceMetadata } from '@ez4/project/library';
import type { AnySchema } from '@ez4/schema';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/validation';

export type ValidationService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    name: string;
    description?: string;
    handler: ValidationHandler;
    schema: AnySchema;
  };

export type ValidationHandler = FunctionSignature;

export const isValidationService = (service: ServiceMetadata): service is ValidationService => {
  return service.type === ServiceType;
};

export const createValidationService = (name: string) => {
  return {
    ...createServiceMetadata<ValidationService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
