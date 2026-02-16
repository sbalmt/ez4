import type { Queue } from '@ez4/queue';

export declare class TestQueue extends Queue.Service<{}> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler;
      vpc: true;
    }>
  ];
}

function testHandler(_request: Queue.Incoming<{}>) {}
