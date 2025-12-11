import type { HttpClient, HttpClientResponse, Http } from '@ez4/gateway';
import type { Mock } from 'node:test';
import type { HttpClientMockOperation } from '../../client/http/mock';

import { Tester } from '@ez4/project/library';

import { createHttpClientMock } from '../../client/http/mock';

export namespace HttpTester {
  export type MockOptions<T extends Http.Service> = {
    default: HttpClientMockOperation | HttpClientResponse;
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
    const client = createHttpClientMock(resourceName, options) as ClientMock<T>;

    return client;
  };
}
