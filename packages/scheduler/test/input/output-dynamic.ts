import type { Environment, Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

interface TestEvent extends Cron.Event {}

export declare class TestScheduler extends Cron.Service<TestEvent> {
  group: 'test-group';

  expression: 'dynamic';

  timezone: 'America/Sao_Paulo';

  maxRetries: 5;

  target: {
    handler: typeof targetHandler;
  };

  services: {
    testCron: Environment.Service<TestScheduler>;
  };
}

function targetHandler(
  _request: Cron.Incoming<TestEvent>,
  _context: Service.Context<TestScheduler>
) {}
