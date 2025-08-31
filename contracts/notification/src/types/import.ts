import type { ServiceMetadata } from '@ez4/project/library';
import type { NotificationFifoMode, NotificationMessageSchema, NotificationSubscription } from './common.js';

export const ImportType = '@ez4/import:notification';

export type NotificationImport = ServiceMetadata & {
  type: typeof ImportType;
  name: string;
  reference: string;
  project: string;
  description?: string;
  schema: NotificationMessageSchema;
  subscriptions: NotificationSubscription[];
  fifoMode?: NotificationFifoMode;
};

export const isNotificationImport = (service: ServiceMetadata): service is NotificationImport => {
  return service.type === ImportType;
};
