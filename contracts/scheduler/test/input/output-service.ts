import type { ArchitectureType, RuntimeType } from '@ez4/project';
import type { Environment } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

/**
 * Scheduler cron description.
 */
export declare class TestScheduler extends Cron.Service {
  group: 'test-group';

  expression: 'rate(1 minute)';

  timezone: 'America/Sao_Paulo';

  startDate: '2024-01-01T:00:00:00Z';

  endDate: '2024-01-01T:23:59:59Z';

  maxRetries: 0;

  maxAge: 20;

  disabled: true;

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
    architecture: ArchitectureType.Arm;
    runtime: RuntimeType.Node24;
    logRetention: 14;
    timeout: 30;
    memory: 128;
    variables: {
      TEST_VAR1: 'test-literal-value';
    };
  }>;

  variables: {
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}

function targetHandler() {}
