import type { ServiceMetadata } from '@ez4/project/library';
import type { QueueSubscription } from './subscription.js';

export const ImportType = '@ez4/import:queue';

export type QueueImport = ServiceMetadata & {
  type: typeof ImportType;
  name: string;
  description?: string;
  subscriptions: QueueSubscription[];
  project: string;
};

export const isQueueImport = (service: ServiceMetadata): service is QueueImport => {
  return service.type === ImportType;
};
