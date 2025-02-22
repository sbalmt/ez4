import type { ServiceMetadata } from '@ez4/project/library';
import type { QueueMessage, QueueSubscription } from './common.js';

export const ServiceType = '@ez4/queue';

export type QueueService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  schema: QueueMessage;
  description?: string;
  subscriptions: QueueSubscription[];
  timeout?: number;
  retention?: number;
  polling?: number;
  delay?: number;
};

export const isQueueService = (service: ServiceMetadata): service is QueueService => {
  return service.type === ServiceType;
};
