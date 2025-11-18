import type { Client, ClientResponse, Http } from '@ez4/gateway';
import type { ClientMockOperation } from '../client/mock';

import { Tester } from '@ez4/project/library';

import { createClientMock } from '../client/mock';

export namespace HttpTester {
  export type MockOptions<T extends Http.Service> = {
    default: ClientMockOperation | ClientResponse;
    operations?: {
      [P in keyof Client<T>]?: Client<T>[P] | Awaited<ReturnType<Client<T>[P]>>;
    };
  };

  export const getClient = <T extends Http.Service>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Http.Service>(resourceName: string, options: MockOptions<T>) => {
    const client = createClientMock(resourceName, options) as Client<T>;

    return client;
  };
}
