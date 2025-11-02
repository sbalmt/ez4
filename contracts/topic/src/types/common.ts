import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type TopicMessageSchema = ObjectSchema | UnionSchema;

export type TopicFifoMode = {
  uniqueId?: string;
  groupId: string;
};

export enum TopicSubscriptionType {
  Lambda = 'lambda',
  Queue = 'queue'
}

export type SubscriptionHandler = {
  name: string;
  module?: string;
  file: string;
  description?: string;
};

export type TopicLambdaSubscription = {
  type: TopicSubscriptionType.Lambda;
  listener?: ServiceListener;
  handler: SubscriptionHandler;
  variables?: LinkedVariables;
  logRetention?: number;
  timeout?: number;
  memory?: number;
};

export type TopicQueueSubscription = {
  type: TopicSubscriptionType.Queue;
  service: string;
};

export type TopicSubscription = TopicLambdaSubscription | TopicQueueSubscription;
