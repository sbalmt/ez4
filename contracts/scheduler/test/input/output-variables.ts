import { Environment, Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
  }>;

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfSettings: Environment.ServiceVariables;
  };
}

function targetHandler(_request: Cron.Incoming<null>, context: Service.Context<TestScheduler>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}
