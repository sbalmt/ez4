import type { ServiceMetadata } from '@ez4/project/library';
import type { QueueFifoMode, QueueMessageSchema, QueueSubscription } from './common.js';

export const ImportType = '@ez4/import:queue';

export type QueueImport = ServiceMetadata & {
  type: typeof ImportType;
  name: string;
  project: string;
  reference: string;
  schema: QueueMessageSchema;
  description?: string;
  fifoMode?: QueueFifoMode;
  subscriptions: QueueSubscription[];
  timeout?: number;
};

export const isQueueImport = (service: ServiceMetadata): service is QueueImport => {
  return service.type === ImportType;
};
