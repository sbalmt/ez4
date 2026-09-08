import type { Cron } from '@ez4/scheduler';

interface TestEvent extends Cron.Event {}

function targetHandler(_request: Cron.Incoming<TestEvent>) {}

export declare class TestScheduler extends Cron.Service<TestEvent> {
  expression: 'dynamic';

  disabled: false;

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
  }>;
}
