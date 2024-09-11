import type { Cron } from '@ez4/scheduler';

// @ts-ignore Missing required handler.
export declare class TestScheduler1 extends Cron.Service {
  expression: 'rate(1 minute)';
}

// @ts-ignore Missing required expression.
export declare class TestScheduler2 extends Cron.Service {
  handler: typeof schedulerHandler;
}

function schedulerHandler() {}
