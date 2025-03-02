import type { ServiceMetadata } from '@ez4/project/library';
import type { CronEventSchema, CronTarget } from './common.js';

export const ServiceType = '@ez4/cron';

export const DynamicExpression = 'dynamic';

export type CronService = ServiceMetadata & {
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
