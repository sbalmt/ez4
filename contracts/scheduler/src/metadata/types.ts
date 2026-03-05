import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

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

export type CronEventSchema = ObjectSchema | UnionSchema;

export type TargetHandler = FunctionSignature;

export type CronTarget = {
  listener?: ServiceListener;
  handler: TargetHandler;
  variables?: LinkedVariables;
  architecture?: ArchitectureType;
  runtime?: RuntimeType;
  logRetention?: number;
  logLevel?: LogLevel;
  timeout?: number;
  memory?: number;
  files?: string[];
  vpc?: boolean;
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
