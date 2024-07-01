import type { QueueMessage } from './message.js';

export type SubscriptionHandler = {
  name: string;
  file: string;
  schema: QueueMessage;
  description?: string;
};
