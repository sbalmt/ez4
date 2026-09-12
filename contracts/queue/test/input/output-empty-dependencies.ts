import type { Queue } from '@ez4/queue';
import type { Service } from '@ez4/common';

interface TestMessage extends Queue.Message {
  value: string;
}

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof handler;
    }>
  ];
}

export function handler(_request: Queue.Incoming<TestMessage>, {}: Service.Context<TestQueue>) {}
