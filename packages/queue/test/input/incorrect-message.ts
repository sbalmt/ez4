import type { Queue } from '@ez4/queue';

export declare class TestQueue extends Queue.Service {
  name: 'Test Queue';

  schema: {};

  subscriptions: [
    {
      handler: typeof testHandler;
    }
  ];
}

// Missing Queue.Message inheritance.
declare class TestMessage {}

export function testHandler(_message: TestMessage) {}
