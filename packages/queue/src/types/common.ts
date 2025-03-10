import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables } from '@ez4/project/library';
import type { ServiceListener } from '@ez4/common/library';

export type QueueMessageSchema = ObjectSchema | UnionSchema;

export type QueueFifoMode = {
  uniqueId?: string;
  groupId: string;
};

export type SubscriptionHandler = {
  name: string;
  file: string;
  description?: string;
};

export type QueueSubscription = {
  listener?: ServiceListener;
  handler: SubscriptionHandler;
  variables?: LinkedVariables | null;
  concurrency?: number;
  memory?: number;
};
