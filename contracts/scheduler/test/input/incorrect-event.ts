import type { Cron } from '@ez4/scheduler';

// Missing Cron.Event inheritance.
interface TestEvent {}

function targetHandler(_request: Cron.Incoming<TestEvent>) {}

export declare class TestScheduler extends Cron.Service<TestEvent> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
  }>;
}
