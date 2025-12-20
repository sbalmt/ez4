import type { FunctionSignature, ServiceListener } from '@ez4/common/library';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { LinkedVariables } from '@ez4/project/library';

export type QueueMessageSchema = ObjectSchema | UnionSchema;

export type QueueFifoMode = {
  uniqueId?: string;
  groupId: string;
};

export type QueueDeadLetter = {
  maxRetries: number;
  retention?: number;
};

export type SubscriptionHandler = FunctionSignature;

export type QueueSubscription = {
  listener?: ServiceListener;
  handler: SubscriptionHandler;
  variables?: LinkedVariables;
  logRetention?: number;
  concurrency?: number;
  batch?: number;
  memory?: number;
};
