import type { AnyObject } from '@ez4/utils';
import type { Factory } from './services/contract';

import { Tester } from '@ez4/project/library';

export namespace FactoryTester {
  export type MockOptions<T> = {
    handler: () => T;
  };

  export const getClient = <T extends Factory.Service<AnyObject>>(
    resourceName: string,
    resourceOptions?: T extends { options: infer O } ? O : undefined
  ) => {
    return Tester.getServiceClient(resourceName, resourceOptions) as T['client'];
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
