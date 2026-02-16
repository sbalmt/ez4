import type { ServiceMetadata } from '@ez4/project/library';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/email';

export type EmailService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    description?: string;
    domain: string;
  };

export const isEmailService = (service: ServiceMetadata): service is EmailService => {
  return service.type === ServiceType;
};

export const createEmailService = (name: string) => {
  return {
    ...createServiceMetadata<EmailService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
