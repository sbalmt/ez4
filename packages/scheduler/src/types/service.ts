import type { ServiceMetadata } from '@ez4/project/library';
import type { LinkedVariables } from '@ez4/project/library';
import type { CronHandler } from './handler.js';

export const ServiceType = '@ez4/cron';

export type CronService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  handler: CronHandler;
  expression: string;
  description?: string;
  disabled?: boolean;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};

export const isCronService = (service: ServiceMetadata): service is CronService => {
  return service.type === ServiceType;
};
