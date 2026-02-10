import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler1 extends Cron.Service<{}> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
    vpc: true;
  }>;
}

export function targetHandler(_request: Cron.Incoming<{}>) {}
