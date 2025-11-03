import type { Client } from '@ez4/storage';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createMockClient } from '../client/mock';

export namespace BucketTester {
  export type ClientMock = Client & {
    exists: Mock<Client['exists']>;
    write: Mock<Client['write']>;
    read: Mock<Client['read']>;
    delete: Mock<Client['delete']>;
    getWriteUrl: Mock<Client['getWriteUrl']>;
    getReadUrl: Mock<Client['getReadUrl']>;
    getStats: Mock<Client['getStats']>;
  };

  export const getClient = (resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client;
  };

  export const getClientMock = (resourceName?: string) => {
    const client = createMockClient(resourceName ?? 'BucketMock');

    mock.method(client, 'exists');
    mock.method(client, 'write');
    mock.method(client, 'read');
    mock.method(client, 'delete');

    mock.method(client, 'getWriteUrl');
    mock.method(client, 'getReadUrl');
    mock.method(client, 'getStats');

    return client as ClientMock;
  };
}
