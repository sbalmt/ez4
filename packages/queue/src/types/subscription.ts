import type { LinkedVariables } from '@ez4/project';
import type { SubscriptionHandler } from './handler.js';

export type QueueSubscription = {
  handler: SubscriptionHandler;
  variables?: LinkedVariables | null;
};
