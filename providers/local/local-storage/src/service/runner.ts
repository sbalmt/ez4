import type { Client } from '@ez4/storage';

import { Runner } from '@ez4/project/library';

export namespace BucketRunner {
  export const getClient = (resourceName: string) => {
    return Runner.getServiceClient(resourceName) as Client;
  };
}
