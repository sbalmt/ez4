import type { Client, Database } from '@ez4/database';

import { Runner } from '@ez4/project/library';

export namespace DatabaseRunner {
  export const getClient = <T extends Database.Service>(resourceName: string) => {
    return Runner.getServiceClient(resourceName) as Client<T>;
  };
}
