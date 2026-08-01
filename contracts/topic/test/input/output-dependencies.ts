import type { Service, Environment } from '@ez4/common';
import type { Topic } from '@ez4/topic';

type TestEvent = {};

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<TestTopic>;
  };
}

function testHandler(_request: Topic.Incoming<TestEvent>, { selfOptions, selfVariables }: Service.Context<TestTopic>) {
  selfVariables;
  selfOptions;
}
