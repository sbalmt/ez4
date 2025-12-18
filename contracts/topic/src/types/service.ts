import type { ServiceMetadata } from '@ez4/project/library';
import type { TopicFifoMode, TopicMessageSchema, TopicSubscription } from './common';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/topic';

export type TopicService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
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

export const createTopicService = (name: string) => {
  return {
    ...createServiceMetadata<TopicService>(ServiceType, name),
    variables: {},
    services: {}
  };
};
