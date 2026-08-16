import type { Cron } from '@ez4/scheduler';

export declare class TestScheduler extends Cron.Service<{}> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
  }>;

  tags: Cron.UseTags<{
    FOO: 'foo';
    BAR: 'bar';
  }>;
}

export function targetHandler(_request: Cron.Incoming<{}>) {}
