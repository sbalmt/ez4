import type { Client, Database } from '@ez4/database';

import { Tester } from '@ez4/project/library';

export namespace DatabaseTester {
  export const getClient = <T extends Database.Service<any>>(resourceName: string, resourceOptions?: T['options']) => {
    return Tester.getServiceClient(resourceName, resourceOptions) as Promise<Client<T>>;
  };
}
