import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
  }>;

  // No extra property is allowed.
  invalid_property: true;
}

function targetHandler() {}
