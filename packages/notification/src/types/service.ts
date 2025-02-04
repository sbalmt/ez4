import type { ServiceMetadata } from '@ez4/project/library';
import type { NotificationMessage, NotificationSubscription } from './common.js';

export const ServiceType = '@ez4/notification';

export type NotificationService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  schema: NotificationMessage;
  description?: string;
  subscriptions: NotificationSubscription[];
};

export const isNotificationService = (service: ServiceMetadata): service is NotificationService => {
  return service.type === ServiceType;
};
