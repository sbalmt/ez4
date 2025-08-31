import type { ServiceMetadata } from '@ez4/project/library';
import type { TopicFifoMode, TopicMessageSchema, TopicSubscription } from './common.js';

export const ImportType = '@ez4/import:topic';

export type TopicImport = ServiceMetadata & {
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
