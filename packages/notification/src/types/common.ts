import type { LinkedVariables } from '@ez4/project/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';

export type NotificationMessage = ObjectSchema | UnionSchema;

export type SubscriptionHandler = {
  name: string;
  file: string;
  description?: string;
};

export type NotificationSubscription = {
  handler: SubscriptionHandler;
  variables?: LinkedVariables | null;
  concurrency?: number;
  memory?: number;
};
