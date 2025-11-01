import type { Cron } from '@ez4/scheduler';

/**
 * Scheduler for testing cron listener.
 */
export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: {
    listener: typeof targetListener;
    handler: typeof targetHandler;
  };
}

function targetListener(): void {}

function targetHandler() {}
