import type { Client, ClientResponse, Http } from '@ez4/gateway';

import { Tester } from '@ez4/project/library';

import { createClientMock } from '../client/mock';

export namespace HttpTester {
  export type MockResponses<T extends Http.Service> = {
    default: ClientResponse;
    operations?: {
      [P in keyof Client<T>]?: Awaited<ReturnType<Client<T>[P]>>;
    };
  };

  export const getClient = <T extends Http.Service>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Http.Service>(resourceName: string, responses: MockResponses<T>) => {
    const client = createClientMock(resourceName, responses) as Client<T>;

    return client;
  };
}
