import type { Cron } from '@ez4/scheduler';

// Concrete class is not allowed.
class TestEvent implements Cron.Event {}

function targetHandler(_request: Cron.Incoming<TestEvent>) {}

export declare class TestScheduler extends Cron.Service<TestEvent> {
  expression: 'dynamic';

  target: {
    handler: typeof targetHandler;
  };
}
