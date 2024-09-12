import type { ServiceMetadata } from '@ez4/project/library';
import type { CronTarget } from './target.js';

export const ServiceType = '@ez4/cron';

export type CronService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  description?: string;
  target: CronTarget;
  expression: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  maxEventAge?: number;
  maxRetryAttempts?: number;
  disabled?: boolean;
};

export const isCronService = (service: ServiceMetadata): service is CronService => {
  return service.type === ServiceType;
};
