import type { Cron } from '@ez4/scheduler';

// @ts-ignore Missing required target.
export declare class TestScheduler1 extends Cron.Service {
  expression: 'rate(1 minute)';
}

export declare class TestScheduler2 extends Cron.Service {
  expression: 'rate(1 minute)';

  // @ts-ignore Missing required target handler.
  target: {};
}

// @ts-ignore Missing required expression.
export declare class TestScheduler3 extends Cron.Service {
  target: {
    handler: typeof targetHandler;
  };
}

// Missing event schema.
export declare class TestScheduler4 extends Cron.Service {
  expression: 'dynamic';

  target: {
    handler: typeof targetHandler;
  };
}

function targetHandler() {}
