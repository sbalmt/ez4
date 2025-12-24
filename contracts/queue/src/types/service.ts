import type { ServiceMetadata } from '@ez4/project/library';
import type { QueueDeadLetter, QueueFifoMode, QueueMessageSchema, QueueSubscription } from './common';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/queue';

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
