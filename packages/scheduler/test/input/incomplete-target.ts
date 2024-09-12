import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  // @ts-ignore Missing required handler.
  target: {};
}
