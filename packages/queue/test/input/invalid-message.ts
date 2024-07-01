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

// Concrete class is not allowed.
class TestMessage implements Queue.Message {}

export function testHandler(_message: TestMessage) {}
