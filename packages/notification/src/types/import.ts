import type { ServiceMetadata } from '@ez4/project/library';
import type { NotificationMessage, NotificationSubscription } from './common.js';

export const ImportType = '@ez4/import:notification';

export type NotificationImport = ServiceMetadata & {
  type: typeof ImportType;
  name: string;
  project: string;
  reference: string;
  schema: NotificationMessage;
  description?: string;
  subscriptions: NotificationSubscription[];
};

export const isNotificationImport = (service: ServiceMetadata): service is NotificationImport => {
  return service.type === ImportType;
};
