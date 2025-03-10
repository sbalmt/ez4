import type { Cron } from '@ez4/scheduler';

interface TestEvent extends Cron.Event {}

// Unnecessary handler incoming event (Scheduler isn't dynamic).
function targetHandler(_request: Cron.Incoming<TestEvent>) {}

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: {
    handler: typeof targetHandler;
  };
}
