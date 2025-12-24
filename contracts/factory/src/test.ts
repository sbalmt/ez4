import { Tester } from '@ez4/project/library';

export namespace FactoryTester {
  export type MockOptions<T> = {
    handler: () => T;
  };

  export const getClient = <T = void>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Promise<T>;
  };

  export const getClientMock = <T = void>(_resourceName: string, options: MockOptions<T>) => {
    return options.handler();
  };
}
