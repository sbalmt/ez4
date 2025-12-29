import type { Cron } from '@ez4/scheduler';

type TestUnionEvent = { foo: string } | { bar: number };

export declare class TestScheduler1 extends Cron.Service<TestUnionEvent> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof targetHandler1;
  }>;
}

export function targetHandler1(_request: Cron.Incoming<TestUnionEvent>) {}

type TestIntersectionMessage = { foo: string } & { bar: number };

export declare class TestScheduler2 extends Cron.Service<TestIntersectionMessage> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof targetHandler2;
  }>;
}

export function targetHandler2() {}
