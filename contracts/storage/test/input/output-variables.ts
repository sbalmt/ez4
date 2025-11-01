import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: {
    path: 'uploads/*';
    handler: typeof eventHandler;
  };

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfSettings: Environment.Variables;
  };
}

function eventHandler(_event: Bucket.Event, context: Service.Context<TestStorage>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}
