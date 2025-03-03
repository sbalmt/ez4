import type { Cron } from '@ez4/scheduler';

interface TestEvent extends Cron.Event {}

function targetHandler(_request: Cron.Incoming<TestEvent>) {}

export declare class TestScheduler extends Cron.Service<TestEvent> {
  expression: 'dynamic';

  // Not allowed for dynamic service.
  timezone: 'America/Sao_Paulo';

  // Not allowed for dynamic service.
  startDate: '2025-04-23T00:00:00Z';

  // Not allowed for dynamic service.
  endDate: '2025-04-30T00:00:00Z';

  // Not allowed for dynamic service.
  disabled: true;

  target: {
    handler: typeof targetHandler;
  };
}
