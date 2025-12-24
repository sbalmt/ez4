import type { ServiceMetadata } from '@ez4/project/library';
import type { CronEventSchema, CronTarget } from './common';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/cron';

export const DynamicExpression = 'dynamic';

export type CronService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    name: string;
    schema?: CronEventSchema;
    description?: string;
    target: CronTarget;
    group?: string;
    expression: string;
    timezone?: string;
    startDate?: string;
    endDate?: string;
    maxAge?: number;
    maxRetries?: number;
    disabled?: boolean;
  };

export const isCronService = (service: ServiceMetadata): service is CronService => {
  return service.type === ServiceType;
};

export const isDynamicCronService = (service: CronService) => {
  return service.expression === DynamicExpression;
};

export const createCronService = (name: string) => {
  return {
    ...createServiceMetadata<CronService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
