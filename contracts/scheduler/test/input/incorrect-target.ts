import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: TestTarget;
}

// Missing Cron.Target inheritance.
declare class TestTarget {
  handler: typeof targetHandler;
}

function targetHandler() {}
