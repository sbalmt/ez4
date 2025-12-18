import type { ServiceMetadata } from '@ez4/project/library';
import type { QueueFifoMode, QueueMessageSchema, QueueSubscription } from './common';

import { createServiceMetadata } from '@ez4/project/library';

export const ImportType = '@ez4/import:queue';

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
