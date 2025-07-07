import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: TestTarget;
}

// Concrete class is not allowed.
class TestTarget implements Cron.Target<null> {
  handler!: typeof targetHandler;
}

function targetHandler() {}
