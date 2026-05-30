import type { Environment } from '@ez4/common';

export declare class TestServiceA {
  client: never;
  options: never;
}

export declare class TestServiceB {
  client: never;

  options: {
    foo: boolean;
    bar?: number;
    baz: string;
  };
}

export declare class ServiceCommonTest {
  services: {
    testServiceA: Environment.Service<TestServiceA>;
    testServiceB: Environment.Service<
      TestServiceB,
      {
        foo: true;
        bar: 123;
        baz: 'abc';
      }
    >;
  };
}
