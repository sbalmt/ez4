import type { Environment } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

/**
 * Scheduler cron description.
 */
export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  timezone: 'America/Sao_Paulo';

  startDate: '2024-01-01T:00:00:00Z';

  endDate: '2024-01-01T:23:59:59Z';

  maxRetryAttempts: 0;

  maxEventAge: 20;

  disabled: true;

  target: {
    handler: typeof targetHandler;

    timeout: 30;

    memory: 128;

    variables: {
      TEST_VAR1: 'test-literal-value';
    };
  };

  variables: {
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}

function targetHandler() {}