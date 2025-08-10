import type { Client, Database } from '@ez4/database';

import { Tester } from '@ez4/project/library';

export namespace DatabaseTester {
  export const getClient = <T extends Database.Service>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };
}
