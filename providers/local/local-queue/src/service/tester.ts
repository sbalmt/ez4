import type { Client, Queue } from '@ez4/queue';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createClientMock } from '../client/mock';

export namespace QueueTester {
  export type ClientMock<T extends Queue.Service<any, any>> = Client<T> & {
    receiveMessage: Mock<Client<T>['receiveMessage']>;
    sendMessage: Mock<Client<T>['sendMessage']>;
  };

  export const getClient = <T extends Queue.Service<any, any>>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Queue.Service<any, any>>(resourceName: string) => {
    const client = createClientMock(resourceName) as ClientMock<T>;

    mock.method(client, 'sendMessage');
    mock.method(client, 'receiveMessage');

    return client;
  };
}
