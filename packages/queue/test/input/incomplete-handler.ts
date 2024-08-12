import type { Queue } from '@ez4/queue';

export declare class TestQueue extends Queue.Service {
  schema: {};

  // @ts-ignore Missing required subscription handler.
  subscriptions: [
    {
      handler: typeof testHandler;
    }
  ];
}

// Missing handler incoming message.
export function testHandler() {}
