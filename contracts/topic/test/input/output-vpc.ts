import type { Topic } from '@ez4/topic';

export declare class TestTopic extends Topic.Service<{}> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;
      vpc: true;
    }>
  ];
}

function testHandler(_request: Topic.Incoming<{}>) {}
