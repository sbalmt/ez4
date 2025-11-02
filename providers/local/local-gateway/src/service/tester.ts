import type { Client, ClientResponse, Http } from '@ez4/gateway';

import { Tester } from '@ez4/project/library';

import { createMockClient } from '../client/mock';

export namespace HttpTester {
  export const getClient = <T extends Http.Service>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Http.Service>(resourceName?: string, mockResponse?: ClientResponse) => {
    const client = createMockClient(resourceName ?? 'ApiMock', mockResponse);

    return client as Client<T>;
  };
}
