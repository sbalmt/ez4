import type { Environment } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

/**
 * Scheduler cron description.
 */
export declare class TestScheduler extends Cron.Service {
  handler: typeof schedulerHandler;

  expression: 'rate(1 minute)';

  disabled: true;

  timeout: 30;

  memory: 128;

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}

function schedulerHandler() {}
