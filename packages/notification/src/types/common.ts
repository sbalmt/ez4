import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type NotificationMessageSchema = ObjectSchema | UnionSchema;

export enum NotificationSubscriptionType {
  Lambda = 'lambda',
  Queue = 'queue'
}

export type SubscriptionHandler = {
  name: string;
  file: string;
  description?: string;
};

export type NotificationLambdaSubscription = {
  type: NotificationSubscriptionType.Lambda;
  listener?: ServiceListener;
  handler: SubscriptionHandler;
  variables?: LinkedVariables | null;
  timeout?: number;
  memory?: number;
};

export type NotificationQueueSubscription = {
  type: NotificationSubscriptionType.Queue;
  service: string;
};

export type NotificationSubscription = NotificationLambdaSubscription | NotificationQueueSubscription;
