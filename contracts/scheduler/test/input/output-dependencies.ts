import type { Environment, Service } from '@ez4/common';
import type { Cron } from '@ez4/scheduler';

type TestUnionEvent = { foo: string } | { bar: number };

export declare class TestScheduler extends Cron.Service<TestUnionEvent> {
  expression: 'dynamic';

  target: Cron.UseTarget<{
    handler: typeof targetHandler;
  }>;

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<TestScheduler>;
  };
}

export function targetHandler(_request: Cron.Incoming<TestUnionEvent>, { selfOptions, selfVariables }: Service.Context<TestScheduler>) {
  selfVariables;
  selfOptions;
}
