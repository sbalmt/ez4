import type { ServiceMetadata } from '@ez4/project/library';
import type { NotificationFifoMode, NotificationMessageSchema, NotificationSubscription } from './common.js';

export const ServiceType = '@ez4/notification';

export type NotificationService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  description?: string;
  schema: NotificationMessageSchema;
  subscriptions: NotificationSubscription[];
  fifoMode?: NotificationFifoMode;
};

export const isNotificationService = (service: ServiceMetadata): service is NotificationService => {
  return service.type === ServiceType;
};
