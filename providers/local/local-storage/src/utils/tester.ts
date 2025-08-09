import type { Client } from '@ez4/storage';

import { Tester } from '@ez4/project/library';

export namespace BucketTester {
  export const getClient = (resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client;
  };
}
