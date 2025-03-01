import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

// Missing handler incoming message.
function testHandlerA() {}

// Missing proper incoming type.
function testHandlerB(_request: any) {}

export declare class TestQueue extends Queue.Service<TestMessage> {
  // @ts-ignore Missing required subscription handler.
  subscriptions: [
    {
      handler: typeof testHandlerA;
    },
    {
      handler: typeof testHandlerB;
    }
  ];
}
