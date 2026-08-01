import type { Service, Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';

type TestMessage = {};

export declare class TestQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<TestQueue>;
  };
}

function testHandler(_request: Queue.Incoming<TestMessage>, { selfOptions, selfVariables }: Service.Context<TestQueue>) {
  selfVariables;
  selfOptions;
}
