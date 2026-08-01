import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'uploads/';
      handler: typeof eventHandler;
    }>
  ];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfVariables: Environment.ServiceVariables;
  };
}

function eventHandler(_event: Bucket.ObjectEvent, context: Service.Context<TestStorage>) {
  const { selfVariables } = context;

  // Ensure variables are property referenced.
  selfVariables.TEST_VAR1;
  selfVariables.TEST_VAR2;
}
