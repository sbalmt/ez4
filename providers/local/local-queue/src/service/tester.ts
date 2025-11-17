import type { Client, Queue } from '@ez4/queue';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createClientMock } from '../client/mock';

export namespace QueueTester {
  export type ClientMock<T extends Queue.Message> = Client<Queue.Service<T>> & {
    receiveMessage: Mock<Client<Queue.Service<T>>['receiveMessage']>;
    sendMessage: Mock<Client<Queue.Service<T>>['sendMessage']>;
  };

  export const getClient = <T extends Queue.Message>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<Queue.Service<T>>;
  };

  export const getClientMock = <T extends Queue.Message = any>(resourceName: string) => {
    const client = createClientMock(resourceName) as ClientMock<T>;

    mock.method(client, 'sendMessage');
    mock.method(client, 'receiveMessage');

    return client;
  };
}
