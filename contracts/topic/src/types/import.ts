import type { ServiceMetadata } from '@ez4/project/library';
import type { TopicFifoMode, TopicMessageSchema, TopicSubscription } from './common';

import { createServiceMetadata } from '@ez4/project/library';

export const ImportType = '@ez4/import:topic';

export type TopicImport = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ImportType;
    name: string;
    reference: string;
    project: string;
    description?: string;
    schema: TopicMessageSchema;
    subscriptions: TopicSubscription[];
    fifoMode?: TopicFifoMode;
  };

export const isTopicImport = (service: ServiceMetadata): service is TopicImport => {
  return service.type === ImportType;
};

export const createTopicImport = (name: string) => {
  return {
    ...createServiceMetadata<TopicImport>(ImportType, name),
    variables: {},
    services: {}
  };
};
