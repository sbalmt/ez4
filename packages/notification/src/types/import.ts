import type { ServiceMetadata } from '@ez4/project/library';
import type { NotificationMessageSchema, NotificationSubscription } from './common.js';

export const ImportType = '@ez4/import:notification';

export type NotificationImport = ServiceMetadata & {
  type: typeof ImportType;
  name: string;
  project: string;
  reference: string;
  description?: string;
  subscriptions: NotificationSubscription[];
  schema: NotificationMessageSchema;
};

export const isNotificationImport = (service: ServiceMetadata): service is NotificationImport => {
  return service.type === ImportType;
};
