import type { ServiceMetadata } from '@ez4/project/library';
import type { QueueMessageSchema, QueueSubscription } from './common.js';

export const ServiceType = '@ez4/queue';

export type QueueService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  schema: QueueMessageSchema;
  description?: string;
  subscriptions: QueueSubscription[];
  timeout?: number;
  retention?: number;
  polling?: number;
  delay?: number;
  order?: boolean;
};

export const isQueueService = (service: ServiceMetadata): service is QueueService => {
  return service.type === ServiceType;
};
