import type { Client } from '@ez4/cache';

import { Runner } from '@ez4/project/library';

export namespace CacheRunner {
  export const getClient = (resourceName: string) => {
    return Runner.getServiceClient(resourceName) as Client;
  };
}
