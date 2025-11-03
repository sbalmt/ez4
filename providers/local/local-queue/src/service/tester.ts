import type { Client, Queue } from '@ez4/queue';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createMockClient } from '../client/mock';

export namespace QueueTester {
  export type ClientMock = Client<Queue.Service<any>> & {
    sendMessage: Mock<Client<Queue.Service<any>>['sendMessage']>;
    receiveMessage: Mock<Client<Queue.Service<any>>['receiveMessage']>;
  };

  export const getClient = <T extends Queue.Message>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<Queue.Service<T>>;
  };

  export const getClientMock = (resourceName?: string) => {
    const client = createMockClient(resourceName ?? 'QueueMock');

    mock.method(client, 'sendMessage');
    mock.method(client, 'receiveMessage');

    return client as ClientMock;
  };
}
