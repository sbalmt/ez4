import type { Client, Queue } from '@ez4/queue';

import { Tester } from '@ez4/project/library';

export namespace QueueTester {
  export const getClient = <T extends Queue.Message>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<Queue.Service<T>>;
  };
}
