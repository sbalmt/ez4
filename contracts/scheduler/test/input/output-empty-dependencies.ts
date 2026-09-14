import type { Cron } from '@ez4/scheduler';
import type { Service } from '@ez4/common';

interface TestEvent extends Cron.Event {
  value: string;
}

export declare class TestScheduler extends Cron.Service<TestEvent> {
  expression: 'dynamic';
  target: Cron.UseTarget<{
    handler: typeof handler;
  }>;
}

export function handler(_request: Cron.Incoming<TestEvent>, {}: Service.Context<TestScheduler>) {}
