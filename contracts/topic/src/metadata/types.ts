import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { LinkedVariables, ServiceMetadata } from '@ez4/project/library';
import type { ArchitectureType, RuntimeType } from '@ez4/project';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

import { createServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/topic';
export const ImportType = '@ez4/import:topic';

export type TopicService = Omit<ServiceMetadata, 'variables' | 'services'> &
  Required<Pick<ServiceMetadata, 'variables' | 'services'>> & {
    type: typeof ServiceType;
    name: string;
    description?: string;
    schema: TopicMessageSchema;
    subscriptions: TopicSubscription[];
    fifoMode?: TopicFifoMode;
  };

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

export type TopicMessageSchema = ObjectSchema | UnionSchema;

export type TopicSubscriptionHandler = FunctionSignature;

export type TopicSubscription = TopicLambdaSubscription | TopicQueueSubscription;

export enum TopicSubscriptionType {
  Lambda = 'lambda',
  Queue = 'queue'
}

export type TopicLambdaSubscription = {
  type: TopicSubscriptionType.Lambda;
  listener?: ServiceListener;
  handler: TopicSubscriptionHandler;
  variables?: LinkedVariables;
  architecture?: ArchitectureType;
  runtime?: RuntimeType;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type TopicQueueSubscription = {
  type: TopicSubscriptionType.Queue;
  service: string;
};

export type TopicFifoMode = {
  uniqueId?: string;
  groupId: string;
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
