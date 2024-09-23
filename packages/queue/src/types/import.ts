import type { ServiceMetadata } from '@ez4/project/library';
import type { QueueSubscription } from './subscription.js';
import type { QueueMessage } from './message.js';

export const ImportType = '@ez4/import:queue';

export type QueueImport = ServiceMetadata & {
  type: typeof ImportType;
  name: string;
  project: string;
  reference: string;
  schema: QueueMessage;
  description?: string;
  subscriptions: QueueSubscription[];
  timeout?: number;
};

export const isQueueImport = (service: ServiceMetadata): service is QueueImport => {
  return service.type === ImportType;
};
