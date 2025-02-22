import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables } from '@ez4/project/library';

export type QueueMessage = ObjectSchema | UnionSchema;

export type SubscriptionHandler = {
  name: string;
  file: string;
  description?: string;
};

export type QueueSubscription = {
  handler: SubscriptionHandler;
  variables?: LinkedVariables | null;
  concurrency?: number;
  memory?: number;
};
