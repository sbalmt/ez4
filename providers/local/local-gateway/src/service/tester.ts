import type { HttpClient, HttpClientResponse, Http } from '@ez4/gateway';
import type { Mock } from 'node:test';
import type { ClientMockOperation } from '../client/mock';

import { Tester } from '@ez4/project/library';

import { createClientMock } from '../client/mock';

export namespace HttpTester {
  export type MockOptions<T extends Http.Service> = {
    default: ClientMockOperation | HttpClientResponse;
    operations?: {
      [P in keyof HttpClient<T>]?: HttpClient<T>[P] | Awaited<ReturnType<HttpClient<T>[P]>>;
    };
  };

  export type ClientMock<T extends Http.Service> = {
    [P in keyof HttpClient<T>]: Mock<HttpClient<T>[P]>;
  };

  export const getClient = <T extends Http.Service>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as HttpClient<T>;
  };

  export const getClientMock = <T extends Http.Service>(resourceName: string, options: MockOptions<T>) => {
    const client = createClientMock(resourceName, options) as ClientMock<T>;

    return client;
  };
}
