import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service<{}> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof testHandler;
  }>;
}

function testHandler() {}
