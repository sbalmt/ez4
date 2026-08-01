import type { Environment, Service } from '@ez4/common';
import type { Bucket } from '@ez4/storage';

export declare class TestStorage extends Bucket.Service {
  events: [
    Bucket.UseEvent<{
      path: 'uploads/';
      handler: typeof eventHandler;
    }>
  ];

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<TestStorage>;
  };
}

export async function eventHandler(_event: Bucket.ObjectEvent, { selfOptions, selfVariables }: Service.Context<TestStorage>) {
  selfVariables;
  selfOptions;
}
