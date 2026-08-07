import type { Service, Environment } from '@ez4/common';
import type { Validation } from '@ez4/validation';
import type { Queue } from '@ez4/queue';

declare class TestValidation extends Validation.Service<string> {
  handler: typeof performValidation;
}

function performValidation(_input: Validation.Input<unknown>) {}

type TestMessage = {
  property: Validation.Use<TestValidation>;
};

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
