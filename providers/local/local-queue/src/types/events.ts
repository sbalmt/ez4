import type { Queue } from '@ez4/queue';

export const enum ProviderEvent {
  PutMessage = 'put-message'
}

export type ProviderMessageEvent = {
  message: Queue.Message;
  delay?: number;
};
