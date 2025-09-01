import type { ServiceMetadata } from '@ez4/project/library';
import type { TopicFifoMode, TopicMessageSchema, TopicSubscription } from './common';

export const ServiceType = '@ez4/topic';

export type TopicService = ServiceMetadata & {
  type: typeof ServiceType;
  name: string;
  description?: string;
  schema: TopicMessageSchema;
  subscriptions: TopicSubscription[];
  fifoMode?: TopicFifoMode;
};

export const isTopicService = (service: ServiceMetadata): service is TopicService => {
  return service.type === ServiceType;
};
