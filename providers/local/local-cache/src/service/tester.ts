import type { Client } from '@ez4/cache';

import { Tester } from '@ez4/project/library';

export namespace CacheTester {
  export const getClient = (resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client;
  };
}
