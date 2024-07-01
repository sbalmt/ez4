import type { ServiceMetadata } from '@ez4/project';
import type { QueueSubscription } from './subscription.js';
import type { QueueMessage } from './message.js';

export const ServiceType = '@ez4/queue';

export type QueueService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  schema: QueueMessage;
  description?: string;
  subscriptions: QueueSubscription[];
};

export const isQueueService = (service: ServiceMetadata): service is QueueService => {
  return service.type === ServiceType;
};
