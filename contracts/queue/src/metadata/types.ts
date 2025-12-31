import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { ArchitectureType, RuntimeType } from '@ez4/project';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/queue';
export const ImportType = '@ez4/import:queue';

export type QueueService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    name: string;
    schema: QueueMessageSchema;
    subscriptions: QueueSubscription[];
    description?: string;
    fifoMode?: QueueFifoMode;
    deadLetter?: QueueDeadLetter;
    timeout?: number;
    retention?: number;
    polling?: number;
    delay?: number;
  };

export type QueueImport = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ImportType;
    name: string;
    reference: string;
    project: string;
    schema: QueueMessageSchema;
    subscriptions: QueueSubscription[];
    description?: string;
    fifoMode?: QueueFifoMode;
    timeout?: number;
  };

export type QueueMessageSchema = ObjectSchema | UnionSchema;

export type QueueSubscriptionHandler = FunctionSignature;

export type QueueFifoMode = {
  uniqueId?: string;
  groupId: string;
};

export type QueueDeadLetter = {
  maxRetries: number;
  retention?: number;
};

export type QueueSubscription = {
  listener?: ServiceListener;
  handler: QueueSubscriptionHandler;
  variables?: LinkedVariables;
  architecture?: ArchitectureType;
  runtime?: RuntimeType;
  logRetention?: number;
  concurrency?: number;
  batch?: number;
  memory?: number;
};

export const isQueueService = (service: ServiceMetadata): service is QueueService => {
  return service.type === ServiceType;
};

export const createQueueService = (name: string) => {
  return {
    ...createServiceMetadata<QueueService>(ServiceType, name),
    variables: {},
    services: {}
  };
};

export const isQueueImport = (service: ServiceMetadata): service is QueueImport => {
  return service.type === ImportType;
};

export const createQueueImport = (name: string) => {
  return {
    ...createServiceMetadata<QueueImport>(ImportType, name),
    variables: {},
    services: {}
  };
};
