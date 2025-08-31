import type { Cron } from '@ez4/scheduler';

interface TestEvent extends Cron.Event {}

// Missing proper incoming type.
function targetHandler(_request: any) {}

export declare class TestScheduler extends Cron.Service<TestEvent> {
  expression: 'dynamic';

  target: {
    handler: typeof targetHandler;
  };
}
