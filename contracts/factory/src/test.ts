import type { AnyObject } from '@ez4/utils';

import { Tester } from '@ez4/project/library';

export namespace FactoryTester {
  export type MockOptions<T> = {
    handler: () => T;
  };

  export const getClient = <T extends AnyObject>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Promise<T>;
  };

  export const getClientMock = <T extends AnyObject>(_resourceName: string, options: MockOptions<T>) => {
    return options.handler();
  };

  export const setClientMock = <T extends AnyObject>(resourceName: string, options: MockOptions<T>) => {
    Tester.mockServiceClient(resourceName, getClientMock(resourceName, options));
  };

  export const restoreClient = (resourceName: string) => {
    Tester.restoreServiceClient(resourceName);
  };
}
