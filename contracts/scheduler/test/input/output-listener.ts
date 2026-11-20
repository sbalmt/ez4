import type { Cron } from '@ez4/scheduler';

/**
 * @description Scheduler for testing cron listener.
 */
export declare class TestScheduler extends Cron.Service {
  expression: 'rate(1 minute)';

  target: Cron.UseTarget<{
    listener: typeof targetListener;
    handler: typeof targetHandler;
  }>;
}

function targetListener<T extends Cron.Event | null>(_event: Cron.ServiceEvent<T>): void {}

function targetHandler() {}
